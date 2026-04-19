"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
  onClick,
  as: Tag = "button",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };

    const onLeave = () => { x.set(0); y.set(0); };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, strength]);

  const inner = (
    <motion.div
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.94 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.div>
  );

  return (
    <div ref={ref} className="inline-flex cursor-none">
      {Tag === "a" ? (
        <a href={href} className="contents">
          {inner}
        </a>
      ) : (
        <button onClick={onClick} className="contents">
          {inner}
        </button>
      )}
    </div>
  );
}
