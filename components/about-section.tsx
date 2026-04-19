"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Monitor, Cpu, Headphones, MapPin } from "lucide-react";
import { useLang } from "@/contexts/language-context";

const cardStats = [
  { label: "Laptops", value: "150+", icon: Monitor },
  { label: "CPUs",    value: "80+",  icon: Cpu     },
  { label: "Gaming",  value: "200+", icon: Headphones },
  { label: "Brands",  value: "30+",  icon: Monitor },
];

function RevealWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, delay: delay + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function TiltImage({ location }: { location: string }) {
  const ref    = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX   = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]),  { stiffness: 200, damping: 28 });
  const rotY   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  { stiffness: 200, damping: 28 });
  const imgX   = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-4%", "4%"]), { stiffness: 200, damping: 28 });
  const imgY   = useSpring(useTransform(mouseY, [-0.5, 0.5], ["-4%", "4%"]), { stiffness: 200, damping: 28 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width  - 0.5);
    mouseY.set((e.clientY - top)  / height - 0.5);
  };

  return (
    <motion.div ref={ref} style={{ perspective: 1000, y: cardY }}>
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="relative group"
      >
        <div className="relative overflow-hidden rounded-3xl aspect-[3/4]">
          <motion.div className="absolute inset-[-8%] w-[116%] h-[116%]" style={{ x: imgX, y: imgY }}>
            <img
              src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80"
              alt="Shelbaya Store"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent" />

          <motion.div
            className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2"
            style={{ translateZ: 30 }}
          >
            <MapPin className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-white text-sm">{location}</span>
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        <div className="grid grid-cols-4 gap-3 mt-5" style={{ transform: "translateZ(20px)" }}>
          {cardStats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              className="text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7C3AED]/40 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Icon className="w-4 h-4 text-[#7C3AED] mx-auto mb-1.5" />
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AboutSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { t, lang } = useLang();
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  const tabs = [
    {
      id: "laptops",
      label: t.tabLaptops,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
              alt="Laptops" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">{t.tabLaptops}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t.tabLaptopsDesc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Dell","HP","Lenovo","Apple","ASUS"].map(b => (
                  <span key={b} className="px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#A855F7] text-xs border border-[#7C3AED]/30">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "gaming",
      label: t.tabGaming,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"
              alt="Gaming" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">{t.tabGaming}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t.tabGamingDesc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["ROG","MSI","Razer","Corsair","SteelSeries"].map(b => (
                  <span key={b} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs border border-purple-500/30">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "peripherals",
      label: t.tabPeripherals,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80"
              alt="Peripherals" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">{t.tabPeripherals}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t.tabPeripheralsDesc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Logitech","Samsung","LG","HyperX","Elgato"].map(b => (
                  <span key={b} className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs border border-violet-500/30">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="about" ref={rootRef} className="relative py-16 md:py-36 bg-[#0C0A09] overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          y: bgY,
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="absolute -right-40 top-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]),
          background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-14 md:mb-24">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-6 h-[2px] bg-[#7C3AED]" />
            <span className="text-[#7C3AED] text-xs tracking-[0.4em] uppercase font-medium">{t.aboutSub}</span>
          </motion.div>

          {/* Small ABOUT label */}
          <div className="overflow-hidden mb-1">
            <motion.p
              className="text-white/20 text-[clamp(0.75rem,2vw,1.1rem)] tracking-[0.35em] uppercase font-light"
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {lang === "ar" ? "عن" : "About"}
            </motion.p>
          </div>

          {/* Big brand name */}
          <div className="overflow-hidden mb-2">
            <motion.h2
              className="text-[clamp(2.8rem,10vw,8rem)] font-black uppercase leading-[0.88] tracking-tighter text-white"
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {lang === "ar" ? "شلباية" : "Shelbaya"}
            </motion.h2>
          </div>

          {/* Sub-brand */}
          <div className="overflow-hidden mb-8">
            <motion.p
              className="text-[clamp(0.9rem,3vw,2rem)] font-bold uppercase tracking-[0.2em] text-[#7C3AED]"
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {lang === "ar" ? "للكمبيوتر" : "For Computers"}
            </motion.p>
          </div>

          {/* Decorative line */}
          <motion.div
            className="h-[1px] bg-gradient-to-r from-[#7C3AED]/50 via-[#7C3AED]/20 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "60%" }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltImage location={t.aboutLocation} />
          </motion.div>

          <div className="space-y-8 pt-4">
            <div className="text-white/80 text-lg leading-relaxed overflow-hidden">
              <RevealWords
                text={t.aboutDesc}
                delay={0.1}
                className="text-white/80 text-lg leading-loose"
              />
            </div>
            <div className="overflow-hidden">
              <RevealWords
                text={t.aboutDesc2}
                delay={0.2}
                className="text-white/55 leading-loose"
              />
            </div>

            <motion.div
              className="h-px bg-gradient-to-r from-[#7C3AED]/40 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <AnimatedTabs tabs={tabs} />
            </motion.div>

            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <MagneticButton strength={0.3}>
                <a href="/store"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-full tracking-widest uppercase text-sm transition-colors duration-300">
                  {t.heroBtn}
                </a>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


