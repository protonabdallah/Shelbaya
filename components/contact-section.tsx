"use client";

import { motion } from "framer-motion";
import { Share2, MessageCircle, Phone, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/language-context";
import { useState } from "react";
import { CONTACT_LINKS, isExternalContactHref, resolveContactHref } from "../lib/contact";

export function ContactSection() {
  const { t } = useLang();
  const phoneLink = CONTACT_LINKS[0];
  const whatsappLink = CONTACT_LINKS[1];
  const facebookLink = CONTACT_LINKS[2];
  const locationLink = CONTACT_LINKS[3];

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#1C1917] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase mb-6">{t.contactSub}</p>
            <h2 className="text-5xl md:text-7xl font-bold text-white uppercase leading-tight mb-8">
              {t.contactTitle}
              <br />
              <span className="text-[#7C3AED]">Shelbaya</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-10 text-lg">
              {t.contactDesc}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <a href={resolveContactHref(phoneLink.href)} className="hover:text-white transition-colors cursor-pointer">
                  {phoneLink.href}
                </a>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <a
                  href={whatsappLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {whatsappLink.label}
                </a>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <a
                  href={locationLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.contactLocation}
                </a>
              </div>

              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <a
                  href={facebookLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {facebookLink.label}
                </a>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              {[
              { Icon: Phone, href: phoneLink.href },
              { Icon: MessageCircle, href: whatsappLink.href },
              { Icon: MapPin, href: locationLink.href },
              { Icon: Share2, href: facebookLink.href },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={resolveContactHref(href)}
                  target={isExternalContactHref(href) ? "_blank" : undefined}
                  rel={isExternalContactHref(href) ? "noopener noreferrer" : undefined}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all duration-300 cursor-pointer"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[340px] gap-5 text-center">
                <CheckCircle className="w-16 h-16 text-[#7C3AED]" />
                <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                <p className="text-white/60">Thank you, we&apos;ll be in touch soon.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-8 py-3 bg-[#7C3AED]/20 hover:bg-[#7C3AED]/40 text-[#7C3AED] rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">{t.fullName}</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 focus:bg-white/8 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">{t.email}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">{t.phone}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+962 7X XXX XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="How can we help you?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm resize-none"
                  />
                </div>

                {status === "error" && errorMsg && (
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl tracking-widest uppercase text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7C3AED]/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />
    </section>
  );
}


