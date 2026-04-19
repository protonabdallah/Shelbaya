"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const GenerativeArt = dynamic(
  () => import("@/components/ui/generative-art").then((m) => m.GenerativeArt),
  { ssr: false }
);

export function GenerativeSection() {
  return (
    <section className="relative bg-[#0C0A09] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#CA8A04] text-xs tracking-[0.4em] uppercase mb-4">
            Interactive Art
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase leading-tight">
            Generative <span className="text-[#CA8A04]">Particles</span>
          </h2>
          <p className="mt-4 text-white/40 text-sm max-w-lg">
            Living, breathing particle systems that draw themselves — click any canvas to regenerate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="rounded-2xl overflow-hidden border border-white/5"
        >
          <GenerativeArt />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/30 to-transparent" />
    </section>
  );
}
