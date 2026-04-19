"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[9998] pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #7C3AED, #a855f7, #7C3AED)",
      }}
    />
  );
}
