"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Navigation } from "@/components/navigation";
import { PostCard } from "@/components/post-card";
import { Camera, Film, Heart, Grid, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ScrollAdventure = dynamic(
  () => import("@/components/ui/animated-scroll"),
  { ssr: false }
);

const categories = [
  { id: "all", label: "All Works", Icon: Grid },
  { id: "photography", label: "Photography", Icon: Camera },
  { id: "videography", label: "Videography", Icon: Film },
  { id: "volunteer", label: "Volunteer", Icon: Heart },
];

interface Post {
  id: number;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  category: string;
  tags?: string | null;
  coverImage?: string | null;
  mediaType: string;
  featured: boolean;
  createdAt: string;
}

function WorksContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") ?? "all";

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", limit: "12", section: "works_page" });
      if (activeCategory !== "all") params.set("category", activeCategory);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
      setPage(1);
      setLoading(false);
    };
    fetchPosts();
  }, [activeCategory]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const params = new URLSearchParams({ page: String(nextPage), limit: "12", section: "works_page" });
    if (activeCategory !== "all") params.set("category", activeCategory);
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts((prev) => [...prev, ...data.posts]);
    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />

      {/* ── Immersive Split-Screen Scroll Header ─────────────────────── */}
      {showScroll && (
        <div>
          <ScrollAdventure />
          <button
            onClick={() => setShowScroll(false)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase">Skip to works</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="relative pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#CA8A0410_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#CA8A04] text-xs tracking-[0.4em] uppercase mb-4">Portfolio</p>
            <h1 className="text-6xl md:text-8xl font-bold text-white uppercase leading-none">
              My <span className="text-[#CA8A04]">Works</span>
            </h1>
            <p className="mt-4 text-white/50 text-sm max-w-lg">
              A curated collection of photography, videography, and volunteer work
              spanning years of creative exploration.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            className="mt-10 flex gap-3 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {categories.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer overflow-hidden ${
                  activeCategory === id
                    ? "text-black"
                    : "text-white/60 border border-white/15 hover:text-white hover:border-white/30"
                }`}
              >
                {activeCategory === id && (
                  <motion.div
                    layoutId="active-category"
                    className="absolute inset-0 bg-[#CA8A04]"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
            <span className="ml-auto self-center text-white/30 text-sm">
              {total} works
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Posts Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && posts.length < total && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={loadMore}
              className="px-10 py-4 border border-white/20 text-white rounded-full text-sm tracking-widest uppercase hover:bg-white/5 hover:border-[#CA8A04] transition-all duration-300 cursor-pointer"
            >
              Load More
            </button>
          </motion.div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-32 text-white/30">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No works found in this category</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WorksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0A09]" />}>
      <WorksContent />
    </Suspense>
  );
}
