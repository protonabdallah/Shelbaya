"use client";

import React, { useState, useEffect, useRef } from "react";

interface PageData {
  leftBgImage: string | null;
  rightBgImage: string | null;
  leftContent: { heading: string; description: string | React.ReactNode } | null;
  rightContent: { heading: string; description: string | React.ReactNode } | null;
}

const defaultPages: PageData[] = [
  {
    leftBgImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=60",
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Photography",
      description:
        "Capturing landscapes, portraits, and authentic moments through a cinematic lens.",
    },
  },
  {
    leftBgImage: null,
    rightBgImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=60",
    leftContent: {
      heading: "Videography",
      description: "Cinematic storytelling through motion — from concept to final cut.",
    },
    rightContent: null,
  },
  {
    leftBgImage:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=60",
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Volunteer Work",
      description:
        "Giving back through the power of visual storytelling for communities in need.",
    },
  },
  {
    leftBgImage: null,
    rightBgImage:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&auto=format&fit=crop&q=60",
    leftContent: {
      heading: "Creative Vision",
      description: "Every frame tells a story — where art meets purpose.",
    },
    rightContent: null,
  },
  {
    leftBgImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&auto=format&fit=crop&q=60",
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: "Explore All Works",
      description: "Scroll down to discover the full portfolio collection.",
    },
  },
];

interface ScrollAdventureProps {
  pages?: PageData[];
}

export default function ScrollAdventure({ pages = defaultPages }: ScrollAdventureProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const numOfPages = pages.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(0);
  const animating = useRef(false);
  const releasing = useRef(false);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (releasing.current) return;

      const el = stickyRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const isStuck = rect.top > -4 && rect.top < 4;
      if (!isStuck) return;

      const goingDown = e.deltaY > 0;
      const cur = currentPageRef.current;

      if (goingDown && cur >= numOfPages - 1) {
        const container = containerRef.current;
        if (container) {
          releasing.current = true;
          window.scrollTo({
            top: container.offsetTop + container.offsetHeight + 20,
            behavior: "smooth",
          });
          setTimeout(() => { releasing.current = false; }, 1400);
        }
        return;
      }

      if (!goingDown && cur <= 0) {
        const container = containerRef.current;
        if (container) {
          releasing.current = true;
          window.scrollTo({
            top: container.offsetTop - window.innerHeight - 20,
            behavior: "smooth",
          });
          setTimeout(() => {
            releasing.current = false;
            setCurrentPage(0);
            currentPageRef.current = 0;
          }, 1400);
        }
        return;
      }

      e.preventDefault();
      if (!animating.current) {
        animating.current = true;
        setCurrentPage((p) => (goingDown ? p + 1 : p - 1));
        setTimeout(() => { animating.current = false; }, 950);
      }
    };

    // Touch support
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (releasing.current) return;
      const el = stickyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > 4 || rect.top < -4) return;
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 30) return;
      const goingDown = diff > 0;
      const cur = currentPageRef.current;
      if (goingDown && cur >= numOfPages - 1) return;
      if (!goingDown && cur <= 0) return;
      e.preventDefault();
      if (!animating.current) {
        animating.current = true;
        setCurrentPage((p) => (goingDown ? p + 1 : p - 1));
        setTimeout(() => { animating.current = false; }, 950);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [numOfPages]);

  const CONTAINER_VH = (numOfPages + 1) * 100;

  return (
    <div ref={containerRef} style={{ height: `${CONTAINER_VH}vh`, position: "relative" }}>
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {pages.map((page, i) => {
          const isActive = currentPage === i;
          const leftTrans = isActive
            ? "translateY(0)"
            : i < currentPage
            ? "translateY(-100%)"
            : "translateY(100%)";
          const rightTrans = isActive
            ? "translateY(0)"
            : i < currentPage
            ? "translateY(100%)"
            : "translateY(-100%)";

          return (
            <div key={i} className="absolute inset-0">
              {/* Left Half */}
              <div
                className="absolute top-0 left-0 w-1/2 h-full"
                style={{
                  transform: leftTrans,
                  transition: "transform 950ms cubic-bezier(0.76, 0, 0.24, 1)",
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: page.leftBgImage ? `url(${page.leftBgImage})` : undefined,
                    backgroundColor: !page.leftBgImage ? "#0C0A09" : undefined,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white p-8">
                    {page.leftContent && (
                      <>
                        <h2 className="text-3xl md:text-5xl font-bold uppercase mb-4 text-center tracking-tight">
                          {page.leftContent.heading}
                        </h2>
                        <p className="text-base md:text-lg text-white/70 text-center max-w-sm">
                          {page.leftContent.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Half */}
              <div
                className="absolute top-0 left-1/2 w-1/2 h-full"
                style={{
                  transform: rightTrans,
                  transition: "transform 950ms cubic-bezier(0.76, 0, 0.24, 1)",
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: page.rightBgImage ? `url(${page.rightBgImage})` : undefined,
                    backgroundColor: !page.rightBgImage ? "#0C0A09" : undefined,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white p-8">
                    {page.rightContent && (
                      <>
                        <h2 className="text-3xl md:text-5xl font-bold uppercase mb-4 text-center tracking-tight">
                          {page.rightContent.heading}
                        </h2>
                        <p className="text-base md:text-lg text-white/70 text-center max-w-sm">
                          {page.rightContent.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Page indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {pages.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: currentPage === i ? "2rem" : "0.5rem",
                background: currentPage === i ? "#CA8A04" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
