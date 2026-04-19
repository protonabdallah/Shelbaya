"use client";

import dynamic from "next/dynamic";

const FullScreenScrollFX = dynamic(
  () => import("@/components/ui/full-screen-scroll-fx").then((m) => m.FullScreenScrollFX),
  { ssr: false }
);

const sections = [
  {
    id: "laptops",
    leftLabel: "Ultra-thin",
    title: "Laptops",
    rightLabel: "High-Performance",
    background:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: "desktops",
    leftLabel: "Custom",
    title: "Desktops",
    rightLabel: "Built for Speed",
    background:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: "gaming",
    leftLabel: "Pro",
    title: "Gaming",
    rightLabel: "Next Level",
    background:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: "peripherals",
    leftLabel: "Smart",
    title: "Peripherals",
    rightLabel: "Precision",
    background:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&auto=format&fit=crop&q=60",
  },
];

export function ScrollShowcase() {
  return (
    <FullScreenScrollFX
      sections={sections}
      header={
        <>
          <div>The Best</div>
          <div>In Tech</div>
        </>
      }
      footer={<div />}
      showProgress
      durations={{ change: 0.7, snap: 800 }}
      colors={{
        text: "rgba(245,245,245,0.92)",
        overlay: "rgba(0,0,0,0.45)",
      }}
    />
  );
}


