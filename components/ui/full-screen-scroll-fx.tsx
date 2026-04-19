"use client";

import React, {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

type Section = {
  id?: string;
  background: string;
  leftLabel?: ReactNode;
  title: string | ReactNode;
  rightLabel?: ReactNode;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

type Durations = Partial<{
  change: number;
  snap: number;
}>;

export type FullScreenFXAPI = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
  refresh: () => void;
};

export type FullScreenFXProps = {
  sections: Section[];
  className?: string;
  style?: CSSProperties;
  fontFamily?: string;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number;
  gridPaddingX?: number;
  showProgress?: boolean;
  debug?: boolean;
  durations?: Durations;
  reduceMotion?: boolean;
  bgTransition?: "fade" | "wipe";
  parallaxAmount?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  colors?: Colors;
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,
      fontFamily = "system-ui, -apple-system, sans-serif",
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,
      showProgress = true,
      debug = false,
      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      bgTransition = "fade",
      parallaxAmount = 4,
      currentIndex,
      onIndexChange,
      initialIndex = 0,
      colors = {
        text: "rgba(245,245,245,0.92)",
        overlay: "rgba(0,0,0,0.35)",
        pageBg: "#0c0a09",
        stageBg: "#000000",
      },
      apiRef,
      ariaLabel = "Full screen scroll",
    },
    ref
  ) => {
    const total = sections.length;
    const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
    const [isMobile, setIsMobile] = useState(false);
    const isControlled = typeof currentIndex === "number";
    const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const fixedRef = useRef<HTMLDivElement | null>(null);
    const fixedSectionRef = useRef<HTMLDivElement | null>(null);
    const bgRefs = useRef<HTMLImageElement[]>([]);
    const wordRefs = useRef<HTMLSpanElement[][]>([]);
    const leftTrackRef = useRef<HTMLDivElement | null>(null);
    const rightTrackRef = useRef<HTMLDivElement | null>(null);
    const leftItemRefs = useRef<HTMLDivElement[]>([]);
    const rightItemRefs = useRef<HTMLDivElement[]>([]);
    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const currentNumberRef = useRef<HTMLSpanElement | null>(null);
    const lastIndexRef = useRef(index);
    const isAnimatingRef = useRef(false);

    const prefersReduced = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    }, []);
    const motionOff = reduceMotion ?? prefersReduced;
    const effectivePaddingX = isMobile ? 0.85 : gridPaddingX;

    useEffect(() => {
      if (typeof window === "undefined") return;

      const media = window.matchMedia("(max-width: 640px)");
      const sync = () => setIsMobile(media.matches);

      sync();

      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
      }

      media.addListener(sync);
      return () => media.removeListener(sync);
    }, []);

    const tempWordBucket = useRef<HTMLSpanElement[]>([]);
    const splitWords = (text: string) => {
      const words = text.split(/\s+/).filter(Boolean);
      return words.map((w, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "middle" }}
        >
          <span
            style={{ display: "inline-block", verticalAlign: "middle" }}
            ref={(el) => { if (el) tempWordBucket.current.push(el); }}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ));
    };

    const WordsCollector = ({ onReady }: { onReady: () => void }) => {
      useEffect(() => { onReady(); }, []); // eslint-disable-line
      return null;
    };

    const measureRAF = (fn: () => void) => {
      if (typeof window === "undefined") return;
      requestAnimationFrame(() => requestAnimationFrame(fn));
    };

    const measureAndCenterLists = (toIndex = index, animate = true) => {
      const centerTrack = (container: HTMLDivElement | null, items: HTMLDivElement[], isRight: boolean) => {
        if (!container || items.length === 0) return;
        const first = items[0];
        const second = items[1];
        const contRect = container.getBoundingClientRect();
        let rowH = first.getBoundingClientRect().height;
        if (second) rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
        const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
        const prop = isRight ? rightTrackRef : leftTrackRef;
        if (!prop.current) return;
        if (animate) {
          gsap.to(prop.current, { y: targetY, duration: (durations.change ?? 0.7) * 0.9, ease: "power3.out" });
        } else {
          gsap.set(prop.current, { y: targetY });
        }
      };
      measureRAF(() => {
        measureRAF(() => {
          centerTrack(leftTrackRef.current, leftItemRefs.current, false);
          centerTrack(rightTrackRef.current, rightItemRefs.current, true);
        });
      });
    };

    const goTo = (to: number) => { changeSection(clamp(to, 0, total - 1)); };

    const changeSection = (to: number) => {
      if (to === lastIndexRef.current || isAnimatingRef.current) return;
      const from = lastIndexRef.current;
      const down = to > from;
      isAnimatingRef.current = true;
      if (!isControlled) setLocalIndex(to);
      onIndexChange?.(to);

      if (currentNumberRef.current) currentNumberRef.current.textContent = String(to + 1).padStart(2, "0");
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${(to / (total - 1 || 1)) * 100}%`;
      }

      const D = durations.change ?? 0.7;
      const outWords = wordRefs.current[from] || [];
      const inWords = wordRefs.current[to] || [];
      if (outWords.length) gsap.to(outWords, { yPercent: down ? -100 : 100, opacity: 0, duration: D * 0.6, stagger: down ? 0.03 : -0.03, ease: "power3.out" });
      if (inWords.length) {
        gsap.set(inWords, { yPercent: down ? 100 : -100, opacity: 0 });
        gsap.to(inWords, { yPercent: 0, opacity: 1, duration: D, stagger: down ? 0.05 : -0.05, ease: "power3.out" });
      }

      const prevBg = bgRefs.current[from];
      const newBg = bgRefs.current[to];
      if (bgTransition === "fade") {
        if (newBg) { gsap.set(newBg, { opacity: 0, scale: 1.04, yPercent: down ? 1 : -1 }); gsap.to(newBg, { opacity: 1, scale: 1, yPercent: 0, duration: D, ease: "power2.out" }); }
        if (prevBg) gsap.to(prevBg, { opacity: 0, yPercent: down ? -parallaxAmount : parallaxAmount, duration: D, ease: "power2.out" });
      } else {
        if (newBg) { gsap.set(newBg, { opacity: 1, clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)", scale: 1, yPercent: 0 }); gsap.to(newBg, { clipPath: "inset(0 0 0 0)", duration: D, ease: "power3.out" }); }
        if (prevBg) gsap.to(prevBg, { opacity: 0, duration: D * 0.8, ease: "power2.out" });
      }

      measureAndCenterLists(to, true);
      leftItemRefs.current.forEach((el, i) => { el.classList.toggle("fx-active", i === to); gsap.to(el, { opacity: i === to ? 1 : 0.35, x: i === to ? 10 : 0, duration: D * 0.6, ease: "power3.out" }); });
      rightItemRefs.current.forEach((el, i) => { el.classList.toggle("fx-active", i === to); gsap.to(el, { opacity: i === to ? 1 : 0.35, x: i === to ? -10 : 0, duration: D * 0.6, ease: "power3.out" }); });

      gsap.delayedCall(D, () => { lastIndexRef.current = to; isAnimatingRef.current = false; });
    };

    useLayoutEffect(() => {
      if (typeof window === "undefined") return;
      const fixed = fixedRef.current;
      const fs = fixedSectionRef.current;
      if (!fixed || !fs || total === 0) return;

      gsap.set(bgRefs.current, { opacity: 0, scale: 1.04, yPercent: 0 });
      if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1, scale: 1 });

      wordRefs.current.forEach((words, sIdx) => {
        words.forEach((w) => gsap.set(w, { yPercent: sIdx === index ? 0 : 100, opacity: sIdx === index ? 1 : 0 }));
      });

      measureAndCenterLists(index, false);

      const ro = new ResizeObserver(() => { measureAndCenterLists(lastIndexRef.current, false); });
      ro.observe(fs);
      return () => { ro.disconnect(); };
    }, [total]); // eslint-disable-line

    // Scroll-lock wheel handler: intercepts scroll while section is stuck,
    // cycles sections one by one, then releases on last section.
    useEffect(() => {
      if (typeof window === "undefined") return;
      const fixed = fixedRef.current;
      if (!fixed || total === 0) return;

      const handleWheel = (e: WheelEvent) => {
        const rect = fixed.getBoundingClientRect();
        // Only intercept when the sticky panel is flush with the top of the viewport
        const isStuck = rect.top > -8 && rect.top < 8;
        if (!isStuck) return;

        const goingDown = e.deltaY > 0;
        const cur = lastIndexRef.current;

        // At last section scrolling down → jump to end of sticky container so next
        // scroll immediately reveals the section below (avoids blank scroll space)
        if (goingDown && cur >= total - 1) {
          e.preventDefault();
          const fs = fixedSectionRef.current;
          if (fs) {
            // Jump well past the sticky zone so rect.top < -4 on the next wheel event
            const endScroll = fs.offsetTop + fs.offsetHeight - window.innerHeight;
            window.scrollTo({ top: endScroll + Math.max(10, window.innerHeight * 0.05), behavior: "instant" as ScrollBehavior });
          }
          return;
        }
        // At first section scrolling up → let scroll through (release)
        if (!goingDown && cur <= 0) return;

        // Still have sections to show — eat the scroll event and change section
        e.preventDefault();
        if (!isAnimatingRef.current) {
          changeSection(goingDown ? cur + 1 : cur - 1);
        }
      };

      // Touch support
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
      const handleTouchEnd = (e: TouchEvent) => {
        const fixed = fixedRef.current;
        if (!fixed) return;
        const rect = fixed.getBoundingClientRect();
        if (rect.top > -4 && rect.top < 4) {
          const diff = touchStartY - e.changedTouches[0].clientY;
          if (Math.abs(diff) < 10) return;
          const goingDown = diff > 0;
          const cur = lastIndexRef.current;
          if (goingDown && cur >= total - 1) {
            e.preventDefault();
            const fs = fixedSectionRef.current;
            if (fs) {
              const endScroll = fs.offsetTop + fs.offsetHeight - window.innerHeight;
              window.scrollTo({ top: endScroll + Math.max(10, window.innerHeight * 0.05), behavior: "instant" as ScrollBehavior });
            }
            return;
          }
          if (!goingDown && cur <= 0) return;
          e.preventDefault();
          if (!isAnimatingRef.current) changeSection(goingDown ? cur + 1 : cur - 1);
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: false });
      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }, [total]); // eslint-disable-line

    useEffect(() => {
      leftItemRefs.current.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: i * 0.06, ease: "power3.out" });
      });
      rightItemRefs.current.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: 0.2 + i * 0.06, ease: "power3.out" });
      });
      measureAndCenterLists(index, false);
    }, []); // eslint-disable-line

    useImperativeHandle(apiRef, () => ({ next: () => goTo(index + 1), prev: () => goTo(index - 1), goTo, getIndex: () => index, refresh: () => {} }));

    const cssVars: CSSProperties = {
      ["--fx-text" as string]: colors.text,
      ["--fx-overlay" as string]: colors.overlay,
      ["--fx-page-bg" as string]: colors.pageBg,
      ["--fx-stage-bg" as string]: colors.stageBg,
    };

    const itemStyle: CSSProperties = {
      color: colors.text,
      fontWeight: 800,
      lineHeight: isMobile ? 0.92 : 1,
      margin: "5px 0",
      opacity: 0.35,
      position: "relative",
      fontSize: isMobile ? "clamp(0.9rem, 3.9vw, 1.05rem)" : "clamp(1rem, 2.4vw, 1.8rem)",
      userSelect: "none",
      cursor: "pointer",
      letterSpacing: 0,
      textTransform: "uppercase",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
      hyphens: "auto",
      maxWidth: isMobile ? "100%" : undefined,
    };

    return (
      <div
        ref={(node) => {
          (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={className}
        style={{ width: "100%", overflow: "clip", background: colors.pageBg, fontFamily, textTransform: "uppercase", letterSpacing: "-0.02em", ...cssVars, ...style }}
        aria-label={ariaLabel}
      >
        {debug && <div style={{ position: "fixed", bottom: 10, right: 10, zIndex: 9999, background: "rgba(255,255,255,0.8)", color: "#000", padding: "6px 8px", fontSize: 12, borderRadius: 4 }}>Section: {index}</div>}

        <div>
          <div ref={fixedSectionRef} style={{ height: `${Math.max(1, total + 1)}00vh`, position: "relative" }}>
            <div ref={fixedRef} style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden", background: colors.pageBg }}>
              {/* Backgrounds */}
              <div style={{ position: "absolute", inset: 0, background: colors.stageBg, zIndex: 1 }} aria-hidden="true">
                {sections.map((s, i) => (
                  <div key={s.id ?? i} style={{ position: "absolute", inset: 0 }}>
                    {s.renderBackground ? s.renderBackground(index === i, lastIndexRef.current === i) : (
                      <>
                        <img
                          ref={(el) => { if (el) bgRefs.current[i] = el; }}
                          src={s.background} alt=""
                          style={{ position: "absolute", inset: "-10% 0", width: "100%", height: "120%", objectFit: "cover", filter: "brightness(0.75)", opacity: 0, willChange: "transform, opacity" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: colors.overlay }} />
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ position: "relative", height: "100%", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: `${gap}rem`, padding: `0 ${effectivePaddingX}rem` }}>
                {header && <div style={{ gridColumn: "1/13", alignSelf: "start", paddingTop: isMobile ? "10vh" : "6vh", fontSize: isMobile ? "clamp(2rem,10vw,4.25rem)" : "clamp(2rem,9vw,9rem)", lineHeight: isMobile ? 0.9 : 0.86, textAlign: "center", color: colors.text }}>{header}</div>}

                <div style={{ gridColumn: "1/13", position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1.3fr 1fr", alignItems: "center", height: "100%", padding: `0 ${effectivePaddingX}rem` }}>
                  {/* Left */}
                  <div style={{ height: isMobile ? "52vh" : "60vh", overflow: "hidden", display: "grid", alignContent: "center", justifyItems: "start", paddingTop: isMobile ? "10vh" : 0 }}>
                    <div ref={leftTrackRef} style={{ willChange: "transform" }}>
                      {sections.map((s, i) => (
                        <div key={`L-${s.id ?? i}`} ref={(el) => { if (el) leftItemRefs.current[i] = el; }}
                          onClick={() => goTo(i)} role="button" tabIndex={0} aria-pressed={i === index}
                          style={{ ...itemStyle, paddingLeft: i === index ? 16 : 0 }}
                        >
                          {s.leftLabel}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center */}
                  <div style={{ display: "grid", placeItems: "center", textAlign: "center", height: isMobile ? "48vh" : "60vh", overflow: "hidden", paddingTop: isMobile ? "5vh" : 0 }}>
                    {sections.map((s, sIdx) => {
                      tempWordBucket.current = [];
                      const isStr = typeof s.title === "string";
                      return (
                        <div key={`C-${s.id ?? sIdx}`} style={{ position: "absolute", opacity: sIdx === index ? 1 : 0, visibility: sIdx === index ? "visible" : "hidden" }}>
                          <h3 style={{ margin: 0, color: colors.text, fontWeight: 900, fontSize: isMobile ? "clamp(1.8rem, 6.8vw, 2.65rem)" : "clamp(2rem,7.5vw,6rem)", letterSpacing: "-0.01em" }}>
                            {isStr ? splitWords(s.title as string) : s.title}
                          </h3>
                          <WordsCollector onReady={() => { if (tempWordBucket.current.length) { wordRefs.current[sIdx] = [...tempWordBucket.current]; } tempWordBucket.current = []; }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Right */}
                  <div style={{ height: isMobile ? "52vh" : "60vh", overflow: "hidden", display: "grid", alignContent: "center", justifyItems: "end", paddingTop: isMobile ? "10vh" : 0 }}>
                    <div ref={rightTrackRef} style={{ willChange: "transform" }}>
                      {sections.map((s, i) => (
                        <div key={`R-${s.id ?? i}`} ref={(el) => { if (el) rightItemRefs.current[i] = el; }}
                          onClick={() => goTo(i)} role="button" tabIndex={0} aria-pressed={i === index}
                          style={{ ...itemStyle, paddingRight: i === index ? 16 : 0, textAlign: "right" }}
                        >
                          {s.rightLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ gridColumn: "1/13", alignSelf: "end", paddingBottom: isMobile ? "4vh" : "5vh", textAlign: "center" }}>
                  {footer && <div style={{ color: colors.text, fontSize: "clamp(1.6rem,7vw,7rem)", fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 0.9 }}>{footer}</div>}
                  {showProgress && (
                    <div style={{ width: isMobile ? 140 : 200, height: 2, margin: "1rem auto 0", background: "rgba(245,245,245,0.28)", position: "relative" }}>
                      <div ref={progressFillRef} style={{ position: "absolute", inset: "0 auto 0 0", width: "0%", background: colors.text, height: "100%", transition: "width 0.3s ease" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
