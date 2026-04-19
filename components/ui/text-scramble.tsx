"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface TextScrambleProps {
  text: string;
  className?: string;
  trigger?: "hover" | "inView" | "always";
  speed?: number;
}

export function TextScramble({ text, className = "", trigger = "hover", speed = 40 }: TextScrambleProps) {
  const [display, setDisplay] = useState(text);
  const frameRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterRef   = useRef(0);
  const resolving = useRef<boolean[]>(text.split("").map(() => false));

  const scramble = useCallback(() => {
    resolving.current = text.split("").map(() => false);
    iterRef.current = 0;

    const step = () => {
      const MAX_ITER = text.length * 3;
      iterRef.current++;
      const progress = iterRef.current / MAX_ITER;

      const next = text.split("").map((char, i) => {
        if (char === " ") return " ";
        if (resolving.current[i]) return text[i];
        if (Math.random() < progress * 1.6) {
          resolving.current[i] = true;
          return text[i];
        }
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });

      setDisplay(next.join(""));

      if (!resolving.current.every(Boolean)) {
        frameRef.current = setTimeout(step, speed);
      } else {
        setDisplay(text);
      }
    };

    step();
  }, [text, speed]);

  // inView trigger
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (trigger !== "inView" || !ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { scramble(); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [trigger, scramble]);

  // always: loop
  useEffect(() => {
    if (trigger !== "always") return;
    const run = () => { scramble(); frameRef.current = setTimeout(run, text.length * speed + 1200); };
    run();
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [trigger, scramble, text.length, speed]);

  const handlers = trigger === "hover"
    ? { onMouseEnter: scramble }
    : {};

  return (
    <span ref={ref} className={`font-mono ${className}`} {...handlers}>
      {display}
    </span>
  );
}
