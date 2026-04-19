"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLang } from "@/contexts/language-context";

export function MarqueeSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    if (!trackRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  const items = [...t.marqueeItems, ...t.marqueeItems];

  return (
    <section className="relative overflow-hidden bg-[#0C0A09] py-5 border-y border-white/5">
      <div ref={trackRef} className="flex gap-0 whitespace-nowrap w-max">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 text-[11px] tracking-[0.35em] uppercase text-white/25 px-7"
          >
            {item}
            <span className="w-[5px] h-[5px] rounded-full bg-[#7C3AED]/70 inline-block flex-shrink-0" />
          </span>
        ))}
      </div>
    </section>
  );
}
