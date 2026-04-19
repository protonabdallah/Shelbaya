"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { useLang } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart, Search, Star, Package, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try { return JSON.parse(images); } catch { return []; }
}

const CATEGORIES_EN = ["all", "laptops", "desktops", "gaming", "peripherals", "monitors", "components", "accessories", "networking"];

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0A09]" />}>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const { t, lang } = useLang();
  const { addItem, count } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("cat") ?? "all");
  const [sort, setSort] = useState("newest");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCat !== "all") params.set("category", selectedCat);
    if (search) params.set("search", search);
    params.set("sort", sort);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [selectedCat, search, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToCart = (p: Product) => {
    if (p.stock === 0) return;
    const imgs = parseImages(p.images);
    addItem({ id: p.id, name: p.name, nameAr: p.nameAr, price: p.price, image: imgs[0] ?? null, stock: p.stock });
    setAddedIds(prev => new Set(prev).add(p.id));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(p.id); return s; }), 2000);
  };

  const categoryLabel = (cat: string) => {
    if (cat === "all") return t.allCategories;
    return (t as unknown as Record<string, string>)[cat] ?? cat;
  };

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />

      {/* Hero banner */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-[#0C0A09]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase mb-4"
          >
            {t.siteTagline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4"
          >
            {t.storeTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg"
          >
            {t.storeSub}
          </motion.p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-0 z-50 bg-[#0C0A09]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 text-sm transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 pr-10 py-3 text-white/70 focus:outline-none focus:border-[#7C3AED]/50 text-sm cursor-pointer"
            >
              <option value="newest">{t.newest}</option>
              <option value="price_asc">{t.priceLow}</option>
              <option value="price_desc">{t.priceHigh}</option>
              <option value="featured">{t.featured}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Cart link */}
          <Link href="/cart" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#A855F7] text-sm font-medium hover:bg-[#7C3AED]/30 transition-all">
            <ShoppingCart className="w-4 h-4" />
            {t.cart} {count > 0 && <span className="bg-[#7C3AED] text-white rounded-full px-2 py-0.5 text-xs">{count}</span>}
          </Link>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES_EN.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                selectedCat === cat
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/10" />
            <p className="text-white/30">{t.noProducts}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => {
                const imgs = parseImages(product.images);
                const cover = imgs[0];
                const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;
                const displayDesc = lang === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
                const isAdded = addedIds.has(product.id);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#7C3AED]/30 transition-all duration-300"
                  >
                    <Link href={`/store/${product.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={displayName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-12 h-12 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {product.featured && (
                          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7C3AED]/30 border border-[#7C3AED]/50 text-[#A855F7] text-[10px] font-semibold">
                            <Star className="w-3 h-3 fill-current" /> {t.featured}
                          </span>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white/60 text-sm font-medium">{t.outOfStock}</span>
                          </div>
                        )}
                        {product.stock > 0 && product.stock <= 5 && (
                          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px]">
                            {product.stock} {t.stockLeft}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-4 space-y-3">
                      {product.brand && (
                        <span className="text-[#7C3AED] text-[10px] font-medium tracking-widest uppercase">{product.brand}</span>
                      )}
                      <Link href={`/store/${product.id}`}>
                        <h3 className="text-white font-semibold text-sm leading-tight hover:text-[#7C3AED] transition-colors line-clamp-2">
                          {displayName}
                        </h3>
                      </Link>
                      {displayDesc && (
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{displayDesc}</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-[#7C3AED] font-bold text-lg">{product.price.toFixed(2)} JD</span>
                          {product.oldPrice && (
                            <span className="text-white/30 line-through text-xs ml-2">{product.oldPrice.toFixed(2)} JD</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isAdded
                              ? "bg-green-500/20 border border-green-500/30 text-green-400"
                              : product.stock === 0
                              ? "bg-white/5 text-white/20 cursor-not-allowed"
                              : "bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#A855F7] hover:bg-[#7C3AED]/30"
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {isAdded ? "✓" : product.stock === 0 ? t.outOfStock : t.addToCart}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0C0A09] py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">&copy; 2026 {t.siteName}</p>
          <p className="text-white/20 text-xs uppercase tracking-widest">{t.siteTagline}</p>
        </div>
      </footer>
    </main>
  );
}
