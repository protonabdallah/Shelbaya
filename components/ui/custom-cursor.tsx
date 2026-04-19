"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const trailX  = useMotionValue(-100);
  const trailY  = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 700, damping: 40, mass: 0.3 });
  const springY = useSpring(cursorY, { stiffness: 700, damping: 40, mass: 0.3 });
  const trailSX = useSpring(trailX,  { stiffness: 120, damping: 22, mass: 0.6 });
  const trailSY = useSpring(trailY,  { stiffness: 120, damping: 22, mass: 0.6 });

  const [hovered, setHovered]   = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hidden, setHidden]     = useState(false);
  const [isTouch, setIsTouch]   = useState(false);

  useEffect(() => {
    setIsTouch(navigator.maxTouchPoints > 0 || !window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
    };

    const enter = () => setHidden(false);
    const leave = () => setHidden(true);
    const down  = () => setClicking(true);
    const up    = () => setClicking(false);

    // Detect hoverable elements
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isLink = t.closest("a, button, [role='button'], [data-cursor='hover']");
      setHovered(!!isLink);
    };

    window.addEventListener("mousemove",   move,   { passive: true });
    window.addEventListener("mouseenter",  enter);
    window.addEventListener("mouseleave",  leave);
    window.addEventListener("mousedown",   down);
    window.addEventListener("mouseup",     up);
    window.addEventListener("mouseover",   onOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove",  move);
      window.removeEventListener("mouseenter", enter);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousedown",  down);
      window.removeEventListener("mouseup",    up);
      window.removeEventListener("mouseover",  onOver);
    };
  }, [cursorX, cursorY, trailX, trailY]);

  if (isTouch) return null;

  return (
    <>
      {/* Outer trail ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border mix-blend-difference"
        style={{
          x: trailSX,
          y: trailSY,
          translateX: "-50%",
          translateY: "-50%",
          width:  hovered ? 56 : clicking ? 20 : 40,
          height: hovered ? 56 : clicking ? 20 : 40,
          borderColor: hovered ? "#CA8A04" : "rgba(255,255,255,0.6)",
          opacity: hidden ? 0 : 1,
          transition: "width 0.25s ease, height 0.25s ease, border-color 0.2s, opacity 0.15s",
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width:  clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          backgroundColor: hovered ? "#CA8A04" : "white",
          opacity: hidden ? 0 : 1,
          transition: "width 0.15s, height 0.15s, background-color 0.2s, opacity 0.15s",
        }}
      />
    </>
  );
}
