"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * An SVG curved path that draws itself as you scroll.
 * Wraps your section and draws a decorative signature-like line.
 */
export function ScrollPathDraw({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] });
  const pathLength = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const opacity    = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M -40 300 C 200 80, 400 520, 700 280 S 1100 60, 1480 300"
          stroke="url(#goldLine)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength, opacity }}
        />
        <defs>
          <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#CA8A04" stopOpacity="0" />
            <stop offset="40%"  stopColor="#CA8A04" stopOpacity="1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * A thin horizontal line that expands outward from center on scroll.
 */
export function ExpandLine({
  className = "",
  color = "#CA8A04",
}: {
  className?: string;
  color?: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 15%"] });
  const scaleX = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="h-px origin-center"
        style={{
          scaleX,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
}
