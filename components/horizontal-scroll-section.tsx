"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/contexts/language-context";

interface Card {
  id: string;
  label: string;
  title: string;
  sub: string;
  image: string;
  href: string;
  accent: string;
}

const CARDS: Card[] = [
  {
    id: "01",
    label: "Laptops",
    title: "Portable Power",
    sub: "Ultra-thin & High-Performance",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=70",
    href: "/store?cat=laptops",
    accent: "#7C3AED",
  },
  {
    id: "02",
    label: "Gaming",
    title: "Level Up",
    sub: "Gaming PCs & Accessories",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=70",
    href: "/store?cat=gaming",
    accent: "#A855F7",
  },
  {
    id: "03",
    label: "Desktops",
    title: "Built Strong",
    sub: "Custom & Pre-built Systems",
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200&auto=format&fit=crop&q=70",
    href: "/store?cat=desktops",
    accent: "#8B5CF6",
  },
  {
    id: "04",
    label: "Peripherals",
    title: "Complete Setup",
    sub: "Keyboards, Mice & More",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&auto=format&fit=crop&q=70",
    href: "/store?cat=peripherals",
    accent: "#6D28D9",
  },
];

function HCard({ card, i }: { card: Card; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={card.href} className="group block relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#111]">
        <div className="relative w-full aspect-[16/7] md:aspect-[21/8] overflow-hidden">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center px-6 md:px-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-[0.4em] uppercase font-semibold" style={{ color: card.accent }}>
                  {card.label}
                </span>
                <span className="text-white/20 text-xs font-mono">{card.id}</span>
              </div>
              <h3 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-2 group-hover:tracking-wide transition-all duration-500">
                {card.title}
              </h3>
              <p className="text-white/50 text-xs md:text-sm tracking-widest uppercase">{card.sub}</p>
            </div>

            <motion.div
              className="flex-shrink-0 flex items-center gap-2 font-semibold text-sm md:text-base"
              style={{ color: card.accent }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="hidden sm:inline">Explore</span>
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ borderColor: card.accent + "80", backgroundColor: card.accent + "15" }}
              >
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function HorizontalScrollSection() {
  const { t } = useLang();

  return (
    <section className="py-16 md:py-24 bg-[#0C0A09]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-10 md:mb-14">
          <motion.p
            className="text-[#7C3AED] text-[10px] tracking-[0.45em] uppercase mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t.categories}
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl font-black uppercase text-white tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            Explore <span className="text-[#7C3AED]">Categories</span>
          </motion.h2>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          {CARDS.map((card, i) => (
            <HCard key={card.id} card={card} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
