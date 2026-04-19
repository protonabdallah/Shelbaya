"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  animate,
} from "framer-motion";
import { useRef, useEffect } from "react";
import { useLang } from "@/contexts/language-context";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function StatsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useLang();
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });

  const bgY   = useTransform(scrollYProgress, [0, 1], ["8%",  "-8%"]);
  const lineW = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "100%", "100%"]);

  const stats = [
    { value: 500,  suffix: "+", label: t.stat1, sub: t.stat1sub },
    { value: 30,   suffix: "+", label: t.stat2, sub: t.stat2sub },
    { value: 2000, suffix: "+", label: t.stat3, sub: t.stat3sub },
  ];

  return (
    <section ref={rootRef} className="relative bg-[#0C0A09] py-32 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          y: bgY,
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute top-1/2 left-0 right-0 overflow-hidden h-px opacity-20">
        <motion.div className="h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent"
          style={{ width: lineW }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <motion.p
          className="text-[#7C3AED] text-[10px] tracking-[0.45em] uppercase mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.byTheNumbers}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {stats.map(({ value, suffix, label, sub }, i) => (
            <motion.div
              key={label}
              className="px-4 md:px-14 py-14 text-center group"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative inline-block">
                <p className="text-[5rem] md:text-[7.5rem] font-black text-white leading-none tracking-tight mb-4 tabular-nums">
                  <CountUp target={value} suffix={suffix} />
                </p>
                <motion.div
                  className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundColor: "#7C3AED" }}
                />
              </div>

              <motion.p
                className="text-white/75 text-base font-medium mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.14 + 0.3 }}
              >
                {label}
              </motion.p>
              <motion.p
                className="text-white/25 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.14 + 0.45 }}
              >
                {sub}
              </motion.p>

              <motion.div
                className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/50 to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "60%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.14 + 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


