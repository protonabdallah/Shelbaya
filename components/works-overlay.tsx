"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

const categories = [
  {
    id: "photography",
    label: "Photography",
    labelAr: "التصوير",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=60",
    stat1: { key: "Style", val: "Documentary" },
    stat2: { key: "Format", val: "RAW + JPEG" },
    stat3: { key: "Focus", val: "Landscape & Portraits" },
    stat4: { key: "Gear", val: "Sony A7 Series" },
    href: "/works?cat=photography",
  },
  {
    id: "videography",
    label: "Videography",
    labelAr: "الفيديو",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60",
    stat1: { key: "Resolution", val: "4K & 8K" },
    stat2: { key: "Style", val: "Cinematic" },
    stat3: { key: "Cut", val: "Premiere Pro" },
    stat4: { key: "Color", val: "DaVinci Resolve" },
    href: "/works?cat=videography",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    labelAr: "التطوع",
    cover: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60",
    stat1: { key: "Cause", val: "Community" },
    stat2: { key: "Impact", val: "Hundreds Served" },
    stat3: { key: "Teams", val: "Local NGOs" },
    stat4: { key: "Since", val: "2018" },
    href: "/works?cat=volunteer",
  },
];

interface WorksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function CategoryCard({ cat, index }: { cat: (typeof categories)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-1 min-w-0 overflow-hidden border-r border-white/15 last:border-r-0 cursor-pointer"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ duration: 1.56, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{
          backgroundImage: `url(${cat.cover})`,
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-500"
        style={{ opacity: hovered ? 0 : 1 }}
      />

      {/* Content */}
      <Link href={cat.href} className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
        <div className="flex flex-col gap-4">
          {/* Number */}
          <span className="text-white/30 font-mono text-sm tracking-widest">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Labels */}
          <div className="overflow-hidden">
            <motion.h2
              className="text-[42px] md:text-[56px] font-black text-white uppercase leading-none tracking-tighter"
              animate={{ y: hovered ? -8 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {cat.label}
            </motion.h2>
          </div>
          <p className="text-[#CA8A04] text-lg font-light tracking-widest">{cat.labelAr}</p>

          {/* Stats — slide up on hover */}
          <motion.div
            className="grid grid-cols-2 gap-x-6 gap-y-3 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {[cat.stat1, cat.stat2, cat.stat3, cat.stat4].map((s) => (
              <div key={s.key}>
                <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">{s.key}</p>
                <p className="text-white text-sm font-medium mt-0.5">{s.val}</p>
              </div>
            ))}
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex items-center gap-2 text-[#CA8A04] text-sm tracking-widest uppercase mt-2"
            animate={{ x: hovered ? 6 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>Explore</span>
            <span>→</span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

export function WorksOverlay({ isOpen, onClose }: WorksOverlayProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col md:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} cat={cat} index={i} />
            ))}
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="fixed top-8 right-8 z-[120] flex items-center gap-2 text-white text-xs tracking-[0.3em] uppercase mix-blend-difference cursor-pointer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <X className="w-4 h-4" />
            Close
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
