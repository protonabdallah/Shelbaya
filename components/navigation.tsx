"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { TextScramble } from "@/components/ui/text-scramble";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useLang } from "@/contexts/language-context";
import { CONTACT_LINKS, isExternalContactHref, resolveContactHref } from "../lib/contact";

interface NavProps {
  onOpenPortfolio?: () => void;
  isOverlayOpen?: boolean;
}

export function Navigation({ onOpenPortfolio, isOverlayOpen = false }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuPanelRef  = useRef<HTMLDivElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const preLayer1Ref  = useRef<HTMLDivElement>(null);
  const preLayer2Ref  = useRef<HTMLDivElement>(null);
  const itemsRef      = useRef<HTMLLIElement[]>([]);
  const toggleBtnRef  = useRef<HTMLButtonElement>(null);
  const labelCycleRef = useRef<HTMLSpanElement>(null);

  const { count } = useCart();
  const { lang, setLang, t } = useLang();
  const menuPanelWidth = "clamp(300px, 86vw, 420px)";

  const menuItems = [
    { label: t.home,    labelEn: "Home",    href: "/",      action: null },
    { label: t.store,   labelEn: "Store",   href: "/store", action: null },
    { label: t.cart,    labelEn: "Cart",    href: "/cart",  action: null },
  ];

  const socials = CONTACT_LINKS;

  useEffect(() => {
    if (!labelCycleRef.current) return;
    const words = isOpen ? ["CLOSE", "X"] : ["MENU", "+"];
    const el = labelCycleRef.current;
    let i = 0;
    const cycle = () => {
      gsap.to(el, { y: -20, opacity: 0, duration: 0.25, ease: "power3.in", onComplete: () => {
        el.textContent = words[i % words.length]; i++;
        gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" });
      }});
    };
    cycle();
  }, [isOpen]);

  useEffect(() => {
    if (!menuPanelRef.current || !preLayer1Ref.current || !preLayer2Ref.current) return;

    if (isOpen) {
      gsap.set([preLayer1Ref.current, preLayer2Ref.current, menuPanelRef.current], { x: "100%" });
      gsap.timeline()
        .to(preLayer1Ref.current, { x: "0%", duration: 0.55, ease: "power3.inOut" })
        .to(preLayer2Ref.current, { x: "0%", duration: 0.55, ease: "power3.inOut" }, "-=0.38")
        .to(menuPanelRef.current, { x: "0%", duration: 0.55, ease: "power3.inOut" }, "-=0.38")
        .fromTo(
          itemsRef.current,
          { yPercent: 140, rotation: 10, opacity: 0 },
          { yPercent: 0, rotation: 0, opacity: 1, duration: 1, stagger: 0.07, ease: "power4.out" },
          "-=0.3"
        );
    } else {
      gsap.timeline()
        .to(itemsRef.current, { yPercent: -80, opacity: 0, duration: 0.35, stagger: 0.03, ease: "power3.in" })
        .to(menuPanelRef.current, { x: "100%", duration: 0.5, ease: "power3.inOut" }, "-=0.2")
        .to(preLayer2Ref.current, { x: "100%", duration: 0.5, ease: "power3.inOut" }, "-=0.35")
        .to(preLayer1Ref.current, { x: "100%", duration: 0.5, ease: "power3.inOut" }, "-=0.35");
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen((v) => !v);

  const handleItemClick = () => setIsOpen(false);

  if (isOverlayOpen) return null;

  return (
    <>
      {/* Logo top-left */}
      <Link
        href="/"
        className="fixed top-4 left-4 md:left-6 z-[200] flex items-center gap-2"
      >
        <Image
          src="/logo.png"
          alt="Shelbaya For Computers"
          width={72}
          height={72}
          className="w-12 h-12 md:w-[72px] md:h-[72px] object-contain drop-shadow-lg"
          unoptimized
        />
      </Link>

      {/* Right controls */}
      <div
        className="fixed top-4 md:top-6 right-4 md:right-6 z-[200] flex items-center gap-2 md:gap-3 max-w-[calc(100vw-4rem)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ right: isOpen ? `calc(${menuPanelWidth} + 16px)` : undefined }}
      >
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="shrink-0 flex items-center gap-1 px-2.5 md:px-3 py-1.5 md:py-2 rounded-full border border-white/20 backdrop-blur-xl bg-white/5 text-white text-[10px] md:text-xs font-medium tracking-[0.22em] md:tracking-widest uppercase hover:bg-white/10 cursor-pointer transition-all"
        >
          <span className={lang === "en" ? "text-[#7C3AED]" : "text-white/40"}>EN</span>
          <span className="text-white/20">/</span>
          <span className={lang === "ar" ? "text-[#7C3AED]" : "text-white/40"}>AR</span>
        </button>

        {/* Cart icon */}
        <Link
          href="/cart"
          className="relative shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20 backdrop-blur-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        {/* Menu toggle */}
        <button
          ref={toggleBtnRef}
          onClick={handleToggle}
          className="shrink-0 flex items-center gap-2 md:gap-3 px-3.5 md:px-5 py-2.5 md:py-3 rounded-full border border-white/20 backdrop-blur-xl bg-white/5 text-white text-xs md:text-sm font-medium tracking-[0.18em] md:tracking-widest uppercase hover:bg-white/10 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className={`inline-block transition-transform duration-500 ${isOpen ? "rotate-[225deg]" : "rotate-0"}`}>+</span>
          <span ref={labelCycleRef} className="inline-block">{isOpen ? "CLOSE" : "MENU"}</span>
        </button>
      </div>

      {/* Pre-layer 1 */}
      <div
        ref={preLayer1Ref}
        className="fixed inset-y-0 right-0 z-[130] translate-x-full"
        style={{ width: menuPanelWidth, backgroundColor: "#7C3AED" }}
      />
      {/* Pre-layer 2 */}
      <div
        ref={preLayer2Ref}
        className="fixed inset-y-0 right-0 z-[140] translate-x-full"
        style={{ width: menuPanelWidth, backgroundColor: "#2D1B69" }}
      />

      {/* Menu Panel */}
      <div
        ref={menuPanelRef}
        className="fixed inset-y-0 right-0 z-[150] translate-x-full bg-[#0C0A09] flex flex-col"
        style={{ width: menuPanelWidth }}
      >
        <div className="flex flex-col h-full px-6 md:px-10 py-20 md:py-24 overflow-y-auto">
          {/* Brand in menu */}
          <div className="mb-8">
            <p className="text-[#7C3AED] text-[10px] tracking-[0.3em] uppercase mb-1">Navigation</p>
            <p className="text-white/30 text-xs">{t.siteName}</p>
          </div>

          <nav className="flex-1">
            <ul className="space-y-0">
              {menuItems.map((item, i) => (
                <li
                  key={item.labelEn}
                  ref={(el) => { if (el) itemsRef.current[i] = el; }}
                  className="overflow-hidden border-b border-white/5"
                >
                  <Link
                    href={item.href}
                    onClick={handleItemClick}
                    className="group flex items-center gap-3 py-4 text-[1.8rem] md:text-[2.2rem] font-black text-white uppercase tracking-tight hover:text-[#7C3AED] transition-colors duration-200 cursor-none"
                  >
                    <span className="text-[#7C3AED]/40 text-xs font-mono w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <TextScramble text={item.labelEn} trigger="hover"
                      className="group-hover:translate-x-1 transition-transform duration-200 not-italic font-black" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-[#7C3AED] text-[10px] tracking-[0.25em] uppercase mb-4">Connect</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={resolveContactHref(s.href)}
                  target={isExternalContactHref(s.href) ? "_blank" : undefined}
                  rel={isExternalContactHref(s.href) ? "noopener noreferrer" : undefined}
                  className="text-white/50 hover:text-white text-sm tracking-wide transition-all duration-200 hover:opacity-100 opacity-60 cursor-pointer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Click-outside overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[120] cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
