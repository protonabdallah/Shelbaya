"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Decorative floating blobs that drift slowly.
 * Place at the section level with absolute/fixed positioning.
 */
export function AmbientShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%",  "-25%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%",  "20%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%",  "-15%"]);
  const r1 = useTransform(scrollYProgress, [0, 1], [0,  45]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large blob — top right */}
      <motion.div
        className="absolute -top-32 -right-32 w-[560px] h-[560px] rounded-full"
        style={{
          y: y1,
          rotate: r1,
          background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.6,
        }}
      />

      {/* Medium blob — center left */}
      <motion.div
        className="absolute top-1/3 -left-24 w-80 h-80 rounded-full"
        style={{
          y: y2,
          background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)",
          filter: "blur(32px)",
          opacity: 0.4,
        }}
      />

      {/* Small blob — bottom center */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full"
        style={{
          y: y3,
          rotate: r2,
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(24px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

// ─── Floating decorative elements that loop ──────────────────────────────────
const FLOATERS = [
  { size: 5,  x: "8%",  y: "15%", dur: 12, delay: 0,   opacity: 0.12 },
  { size: 4,  x: "65%", y: "60%", dur: 14, delay: 3,   opacity: 0.10 },
  { size: 7,  x: "88%", y: "75%", dur: 16, delay: 1,   opacity: 0.07 },
];

export function FloatingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#CA8A04]"
          style={{
            width: f.size,
            height: f.size,
            left: f.x,
            top: f.y,
            opacity: f.opacity,
          }}
          animate={{ y: [0, -16, 0, 16, 0] }}
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
