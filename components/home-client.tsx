"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturedWorks } from "@/components/featured-works";
import { ContactSection } from "@/components/contact-section";
import { ScrollShowcase } from "@/components/scroll-showcase";
import { MarqueeSection } from "@/components/marquee-section";
import { HorizontalScrollSection } from "@/components/horizontal-scroll-section";
import { useLang } from "@/contexts/language-context";

interface Product {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  category: string;
  brand?: string | null;
  images?: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

interface HomeClientProps {
  featuredProducts: Product[];
}

export function HomeClient({ featuredProducts }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    router.refresh();
  }, []);

  return (
    <main className="relative">
      <Navigation />

      {/* 1) Hero */}
      <HeroSection isMenuOpen={isMenuOpen} />

      {/* 2) FullScreenScrollFX */}
      <ScrollShowcase />

      {/* 2.5) Marquee ticker */}
      <MarqueeSection />

      {/* 3) Horizontal scroll category explorer */}
      <HorizontalScrollSection />

      {/* 4) Featured Products */}
      <FeaturedWorks products={featuredProducts} />

      {/* 5) Contact */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-[#0C0A09] py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm font-light tracking-wider">
            Â© 2026 {t.siteName}. All rights reserved.
          </p>
          <p className="text-white/20 text-xs tracking-widest uppercase">
            {t.siteTagline}
          </p>
        </div>
      </footer>
    </main>
  );
}


