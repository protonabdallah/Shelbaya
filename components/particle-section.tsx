"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const ParticleTextEffect = dynamic(
  () => import("@/components/ui/particle-text-effect").then((m) => m.ParticleTextEffect),
  { ssr: false }
);

const WORDS = ["AHMAD", "AL-KISWANY", "PHOTOGRAPHER", "VIDEO EDITOR", "VOLUNTEER", "CREATIVE"];

export function ParticleSection() {
  return (
    <section className="relative bg-[#0C0A09] overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/40 to-transparent" />

      {/* Label */}
      <motion.div
        className="flex flex-col items-center pt-20 pb-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-[#CA8A04] text-[10px] tracking-[0.45em] uppercase mb-2">
          Identity
        </p>
        <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase">
          
        </p>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.2 }}
      >
        <ParticleTextEffect
          words={WORDS}
          canvasWidth={1400}
          canvasHeight={340}
          interval={210}
          className="w-full"
        />
      </motion.div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/40 to-transparent" />
    </section>
  );
}
