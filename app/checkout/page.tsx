"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { useLang } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { motion } from "framer-motion";
import { CheckCircle, Package, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  notes: string;
}

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const { items, total, clearCart, count } = useCart();
  const [form, setForm] = useState<FormData>({
    customerName: "", customerEmail: "", customerPhone: "",
    customerAddress: "", city: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      setOrderId(data.order.id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <main className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
        <Navigation />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6 max-w-md"
        >
          <div className="w-20 h-20 bg-[#7C3AED]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#7C3AED]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.orderSuccess}</h1>
          <p className="text-white/50 mb-2">{t.orderSuccessMsg}</p>
          <p className="text-[#7C3AED] font-semibold mb-8">#{orderId}</p>
          <Link href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-medium hover:bg-[#6D28D9] transition-all">
            {t.continueShopping}
          </Link>
        </motion.div>
      </main>
    );
  }

  if (count === 0) {
    return (
      <main className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-white/10" />
          <p className="text-white/30 mb-4">{t.cartEmpty}</p>
          <Link href="/store" className="text-[#7C3AED] hover:underline">{t.storeTitle}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase mb-3">{t.store}</p>
            <h1 className="text-5xl font-black text-white uppercase">{t.checkout}</h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {([
                { name: "customerName",    label: t.name,    type: "text",  required: true },
                { name: "customerEmail",   label: t.email,   type: "email", required: true },
                { name: "customerPhone",   label: t.phone,   type: "tel",   required: true },
                { name: "customerAddress", label: t.address, type: "text",  required: true },
                { name: "city",            label: t.city,    type: "text",  required: true },
              ] as Array<{ name: keyof FormData; label: string; type: string; required: boolean }>)
                .map(field => (
                  <div key={field.name}>
                    <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
                    />
                  </div>
                ))}
              <div>
                <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">{t.notes}</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t.placeOrder}
              </button>
            </motion.form>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-semibold">{t.orderSummary}</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {lang === "ar" && item.nameAr ? item.nameAr : item.name}
                        </p>
                        <p className="text-white/40 text-xs">×{item.quantity}</p>
                      </div>
                      <span className="text-white font-medium text-sm">{(item.price * item.quantity).toFixed(2)} JD</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between font-bold text-white text-lg">
                  <span>{t.total}</span>
                  <span className="text-[#7C3AED]">{total.toFixed(2)} JD</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
