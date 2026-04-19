"use client";

/**
 * Clip-path based reveal — content slides in from below a clipping mask.
 * Use <Reveal> to wrap any element that should animate on scroll.
 * Use <SplitHeading> for letter-by-letter heading reveals.
 */

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

// ─── Clip-path Reveal ────────────────────────────────────────────────────────
interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

const directionMap = {
  up:    { y: 60,   x: 0   },
  down:  { y: -40,  x: 0   },
  left:  { y: 0,    x: 60  },
  right: { y: 0,    x: -60 },
};

export function Reveal({
  children,
  delay = 0,
  duration = 0.8,
  className = "",
  direction = "up",
  once = true,
}: RevealProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const { x, y } = directionMap[direction];

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y, x, opacity: 0 }}
        animate={inView ? { y: 0, x: 0, opacity: 1 } : { y, x, opacity: 0 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Clip-path Block Reveal ───────────────────────────────────────────────────
export function ClipReveal({
  children,
  delay = 0,
  duration = 0.9,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={inView ? { clipPath: "inset(0 0 0% 0)" } : { clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Split Heading — letter by letter ────────────────────────────────────────
interface SplitHeadingProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const container = (stagger: number) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: 0 },
  },
});

const letter: Variants = {
  hidden:  { y: "110%", opacity: 0, rotateZ: 8 },
  visible: { y: "0%",   opacity: 1, rotateZ: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function SplitHeading({
  text,
  className = "",
  delay = 0,
  stagger = 0.035,
  as: Tag = "h2",
}: SplitHeadingProps) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: "-60px" });

  const words = text.split(" ");

  return (
    // @ts-expect-error polymorphic tag
    <Tag ref={ref} className={`${className}`} aria-label={text}>
      <motion.span
        variants={container(stagger)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ display: "inline" }}
        transition={{ delayChildren: delay }}
      >
        {words.map((word, wi) => (
          <span key={wi} className="inline-block overflow-hidden mr-[0.25em]">
            {word.split("").map((char, ci) => (
              <motion.span
                key={ci}
                variants={letter}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
