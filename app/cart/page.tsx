"use client";

import { Navigation } from "@/components/navigation";
import { useLang } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { t, lang } = useLang();
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase mb-3">{t.store}</p>
            <h1 className="text-5xl font-black text-white uppercase">{t.cart}</h1>
            <p className="text-white/40 mt-2">{count} {t.cartItems}</p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/10" />
              <p className="text-white/30 mb-6">{t.cartEmpty}</p>
              <Link href="/store"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9] transition-all">
                {t.storeTitle} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {/* Items */}
              <div className="md:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-4 bg-white/5 border border-white/8 rounded-2xl p-4"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm leading-tight mb-1">
                          {lang === "ar" && item.nameAr ? item.nameAr : item.name}
                        </h3>
                        <p className="text-[#7C3AED] font-bold">{item.price.toFixed(2)} JD</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-white/30 text-xs ml-2">{(item.price * item.quantity).toFixed(2)} JD</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/30 hover:text-red-400 transition-colors self-start cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button onClick={clearCart} className="text-white/30 hover:text-red-400 text-xs transition-colors cursor-pointer">
                  {t.clearCart}
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
                  <h2 className="text-white font-semibold">{t.orderSummary}</h2>
                  <div className="space-y-2">
                    {items.map(i => (
                      <div key={i.id} className="flex justify-between text-sm text-white/50">
                        <span className="truncate">{lang === "ar" && i.nameAr ? i.nameAr : i.name} ×{i.quantity}</span>
                        <span>{(i.price * i.quantity).toFixed(2)} JD</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between font-bold text-white">
                    <span>{t.total}</span>
                    <span className="text-[#7C3AED]">{total.toFixed(2)} JD</span>
                  </div>
                  <Link href="/checkout"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-all">
                    {t.checkout} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/store" className="block text-center text-white/40 hover:text-white text-sm transition-colors">
                    ← {t.continueShopping}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
