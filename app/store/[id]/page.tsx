"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { useLang } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Star, Package, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  category: string;
  brand: string | null;
  images: string | null;
  featured: boolean;
}

export default function ProductPage() {
  const params = useParams();
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    const images = product.images ? JSON.parse(product.images) : [];
    addItem({ id: product.id, name: product.name, nameAr: product.nameAr, price: product.price, image: images[0] ?? null, stock: product.stock }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />
      <div className="pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    </main>
  );

  if (!product) return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />
      <div className="pt-32 text-center">
        <p className="text-white/30">Product not found</p>
        <Link href="/store" className="text-[#7C3AED] mt-4 block">← {t.storeTitle}</Link>
      </div>
    </main>
  );

  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDesc = lang === "ar" && product.descriptionAr ? product.descriptionAr : product.description;

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Link href="/store" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> {t.storeTitle}
          </Link>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#111]">
                {images[activeImg] ? (
                  <img src={images[activeImg]} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-20 h-20 text-white/10" />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7C3AED]/30 border border-[#7C3AED]/50 text-[#A855F7] text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" /> {t.featured}
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        activeImg === i ? "border-[#7C3AED]" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {product.brand && (
                <span className="text-[#7C3AED] text-xs font-medium tracking-widest uppercase">{product.brand}</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{displayName}</h1>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-[#7C3AED]">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-white/30 line-through text-xl">${product.oldPrice.toFixed(2)}</span>
                )}
                {product.oldPrice && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {displayDesc && (
                <p className="text-white/60 leading-relaxed whitespace-pre-line">{displayDesc}</p>
              )}

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.stock === 0 ? "bg-red-500/20 text-red-400" :
                  product.stock <= 5 ? "bg-orange-500/20 text-orange-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  {product.stock === 0 ? t.outOfStock : product.stock <= 5 ? `${product.stock} ${t.stockLeft}` : t.inStock}
                </span>
                <span className="text-white/30 text-xs capitalize">{product.category}</span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-white/60 hover:text-white cursor-pointer">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white w-8 text-center font-medium">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-white/60 hover:text-white cursor-pointer">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all cursor-pointer ${
                      added
                        ? "bg-green-500/20 border border-green-500/30 text-green-400"
                        : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {added ? "✓ Added!" : t.addToCart}
                  </button>
                </div>
              )}

              <Link href="/cart"
                className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 text-white/60 rounded-xl hover:border-white/30 hover:text-white transition-all text-sm">
                {t.cart}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
