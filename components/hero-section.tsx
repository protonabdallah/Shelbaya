"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ShaderHeroBg } from "@/components/ui/shader-hero-bg";
import { MorphingText } from "@/components/ui/liquid-text";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useLang } from "@/contexts/language-context";
import Link from "next/link";

const POOL_SIZE = 8;
const MIN_DIST = 60;

interface HeroSectionProps {
  isMenuOpen?: boolean;
  onOpenPortfolio?: () => void;
}

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.96, ease: [0.22, 1, 0.36, 1] as const } },
  exit:   { opacity: 0, y: -30, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
  exit:   { transition: { staggerChildren: 0.06, staggerDirection: -1 as const } },
};

const morphTexts = ["Laptops", "Desktops", "Gaming Gear", "Peripherals", "Monitors", "Components", "Ø§Ù„Ù„Ø§Ø¨ØªÙˆØ¨Ø§Øª", "Ø§Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ±Ø§Øª"];

export function HeroSection({ isMenuOpen = false }: HeroSectionProps) {
  const sectionRef    = useRef<HTMLElement>(null);
  const ripplePoolRef = useRef<HTMLDivElement[]>([]);
  const rippleDataRef = useRef<{ active: boolean; age: number; x: number; y: number }[]>([]);
  const lastSpawnRef  = useRef({ x: 0, y: 0 });
  const rafRef        = useRef(0);
  const idxRef        = useRef(0);
  const { t, isRtl } = useLang();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const heroY      = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "25%"]),  { stiffness: 120, damping: 25 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    rippleDataRef.current = Array.from({ length: POOL_SIZE }, () => ({ active: false, age: 0, x: 0, y: 0 }));

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastSpawnRef.current.x;
      const dy = e.clientY - lastSpawnRef.current.y;
      if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
      lastSpawnRef.current = { x: e.clientX, y: e.clientY };
      const d = rippleDataRef.current[idxRef.current];
      d.active = true; d.age = 0; d.x = e.clientX; d.y = e.clientY;
      idxRef.current = (idxRef.current + 1) % POOL_SIZE;
    };

    const FPS = 24, FRAME = 1000 / FPS;
    let last = 0;
    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (now - last < FRAME) return;
      last = now;
      for (let i = 0; i < POOL_SIZE; i++) {
        const d = rippleDataRef.current[i], el = ripplePoolRef.current[i];
        if (!el) continue;
        if (!d.active) { el.style.opacity = "0"; continue; }
        d.age += 0.016;
        if (d.age >= 1) { d.active = false; el.style.opacity = "0"; continue; }
        const size = 18 + d.age * 220, half = size / 2;
        const opacity = Math.max(0, 1 - Math.pow(d.age, 1.1));
        el.style.transform = `translate(${d.x - half}px, ${d.y - half}px)`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = String(opacity);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  const btnShift = isMenuOpen ? "translate-x-[calc(-1*clamp(260px,38vw,420px))]" : "translate-x-0";

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden bg-black">
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="threshold">
            <feColorMatrix in="SourceGraphic" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>

      <ShaderHeroBg />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/85 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-[1]" />

      {/* Purple tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-[#A855F7]/5 z-[1]" />

      {/* Ripple trail */}
      <div className="absolute inset-0 z-[30] pointer-events-none overflow-hidden">
        {Array.from({ length: POOL_SIZE }).map((_, i) => (
          <div key={i} ref={(el) => { if (el) ripplePoolRef.current[i] = el; }}
            className="absolute rounded-full opacity-0"
            style={{
              top: 0, left: 0,
              border: "1px solid rgba(124,58,237,0.5)",
              boxShadow: "0 0 10px rgba(124,58,237,0.15)",
              willChange: "transform, opacity, width, height",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 z-[20] pointer-events-none"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="hero-text"
            className={`absolute top-24 ${isRtl ? "right-6 md:right-24 items-end text-right" : "left-6 md:left-24 items-start"} flex flex-col`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={textVariants} className="overflow-hidden mb-4">
              <p className="text-white/40 text-[10px] md:text-xs tracking-[0.4em] uppercase font-light">
                {t.siteTagline}
              </p>
            </motion.div>

            <motion.div variants={textVariants} className="overflow-hidden">
              <h1 className="text-[42px] md:text-[100px] lg:text-[120px] font-black text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
                Shelbaya
              </h1>
            </motion.div>

            <motion.div variants={textVariants} className="overflow-hidden">
              <h1 className="text-[42px] md:text-[100px] lg:text-[120px] font-black text-[#7C3AED] leading-none uppercase tracking-tighter drop-shadow-2xl">
                Computers
              </h1>
            </motion.div>

            <motion.div variants={textVariants} className="overflow-hidden mt-4">
              <MorphingText
                texts={morphTexts}
                className="text-white/80 !text-left !mx-0 h-10 md:h-14 lg:text-[2rem] max-w-xs"
              />
            </motion.div>

            <motion.p
              variants={textVariants}
              className="mt-8 max-w-[300px] text-[10px] md:text-xs font-normal text-white/55 leading-relaxed tracking-[0.18em]"
            >
              {t.siteDescription.toUpperCase()}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="absolute bottom-10 left-6 md:left-24 flex flex-col items-start gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <span className="text-white/35 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-px h-14 bg-gradient-to-b from-white/35 to-transparent ml-1" />
        </motion.div>

        <motion.div
          className={`absolute bottom-8 right-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${btnShift} ${isMenuOpen ? "hidden md:block" : ""}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <Link href="/store" className="pointer-events-auto">
            <MagneticButton strength={0.3}
              className={`px-6 py-3 md:px-12 md:py-5 text-[13px] md:text-[18px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 backdrop-blur-md ${
                isMenuOpen
                  ? "bg-[#7C3AED] text-white hover:bg-white hover:text-black"
                  : "bg-white text-black hover:bg-[#7C3AED] hover:text-white"
              }`}>
              {t.heroBtn}
            </MagneticButton>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
