"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { SplitHeading } from "@/components/ui/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingCart, Monitor } from "lucide-react";
import { useRef } from "react";
import { useLang } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";

interface Product {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  category: string;
  brand?: string | null;
  images?: string | null;
  featured: boolean;
}

function parseImages(images?: string | null): string[] {
  if (!images) return [];
  try { return JSON.parse(images); } catch { return []; }
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLang();
  const { addItem } = useCart();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX   = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]),  { stiffness: 200, damping: 28 });
  const rotY   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]),  { stiffness: 200, damping: 28 });
  const imgX  = useTransform(mouseX, [-0.5, 0.5], ["-3%", "3%"]);
  const imgY  = useTransform(mouseY, [-0.5, 0.5], ["-3%", "3%"]);
  const sImgX = useSpring(imgX, { stiffness: 200, damping: 28 });
  const sImgY = useSpring(imgY, { stiffness: 200, damping: 28 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width  - 0.5);
    mouseY.set((e.clientY - top)  / height - 0.5);
  };
  const handleLeave = () => { mouseX.set(0); mouseY.set(0); };

  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  const images = parseImages(product.images);
  const coverImage = images[0];
  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;

  return (
    <motion.article
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ y: cardY, perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="group relative cursor-none"
      >
        <Link href={`/store/${product.id}`} className="block">
          <div className="relative overflow-hidden rounded-3xl aspect-[16/9] bg-[#1C1917]"
            style={{ transform: "translateZ(0)" }}>

            {coverImage ? (
              <motion.div
                ref={imageRef}
                className="absolute inset-[-6%] w-[112%] h-[112%]"
                style={{ x: sImgX, y: sImgY }}
              >
                <img src={coverImage} alt={displayName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="w-16 h-16 text-white/10" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

            {product.featured && (
              <motion.div
                className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#7C3AED]/25 border border-[#7C3AED]/55 text-[#A855F7]"
                style={{ translateZ: 30 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 + 0.4 }}
              >
                <Star className="w-3 h-3 fill-current" /> {t.featured}
              </motion.div>
            )}

            {product.brand && (
              <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white/80"
                style={{ transform: "translateZ(30px)" }}>
                {product.brand}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-7"
              style={{ transform: "translateZ(35px)" }}>
              <motion.h3
                className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2 group-hover:text-[#7C3AED] transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 + 0.3 }}
              >
                {displayName}
              </motion.h3>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#7C3AED] font-bold text-xl">{product.price.toFixed(2)} JD</span>
                  {product.oldPrice && (
                    <span className="text-white/40 line-through text-sm">{product.oldPrice.toFixed(2)} JD</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (product.stock > 0) {
                      addItem({ id: product.id, name: product.name, nameAr: product.nameAr, price: product.price, image: coverImage, stock: product.stock });
                    }
                  }}
                  disabled={product.stock === 0}
                  className="flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:text-[#A855F7] transition-colors disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? t.outOfStock : t.addToCart}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}

interface FeaturedWorksProps {
  products: Product[];
}

export function FeaturedWorks({ products }: FeaturedWorksProps) {
  const { t } = useLang();

  return (
    <section id="featured" className="py-32 bg-[#0C0A09] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-16 overflow-hidden">
          <div>
            <motion.p
              className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              {t.store}
            </motion.p>
            <SplitHeading
              text="Featured Products"
              as="h2"
              className="text-5xl md:text-6xl font-bold text-white uppercase leading-tight"
              delay={0.1}
              stagger={0.04}
            />
          </div>

          <MagneticButton strength={0.25}>
            <Link href="/store"
              className="hidden md:flex items-center gap-3 text-white/50 hover:text-white text-sm tracking-widest uppercase transition-colors group px-5 py-3 border border-white/10 rounded-full hover:border-white/30">
              {t.storeTitle}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </div>

        <motion.div className="mt-4 text-center md:hidden"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link href="/store"
            className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white rounded-full text-sm tracking-widest uppercase hover:bg-white/10 transition-all">
            {t.storeTitle} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


