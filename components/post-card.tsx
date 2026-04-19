"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Camera, Film, Heart, Calendar } from "lucide-react";
import { useRef } from "react";

interface Post {
  id: number;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  category: string;
  tags?: string | null;
  coverImage?: string | null;
  mediaType: string;
  featured: boolean;
  createdAt: string | Date;
}

const categoryIcons   = { photography: Camera, videography: Film, volunteer: Heart };
const categoryColors  = { photography: "#CA8A04", videography: "#0EA5E9", volunteer: "#10B981" };
const categoryLabels  = { photography: "Photography", videography: "Videography", volunteer: "Volunteer" };

export function PostCard({ post, index }: { post: Post; index: number }) {
  const ref   = useRef<HTMLDivElement>(null);
  const Icon  = categoryIcons[post.category  as keyof typeof categoryIcons]  ?? Camera;
  const color = categoryColors[post.category as keyof typeof categoryColors] ?? "#CA8A04";
  const label = categoryLabels[post.category as keyof typeof categoryLabels] ?? post.category;

  // Mouse position relative to card center (–0.5 → +0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]),  { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]),  { stiffness: 300, damping: 30 });
  const glareX  = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY  = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width  - 0.5);
    mouseY.set((e.clientY - top)  / height - 0.5);
  };
  const handleLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative cursor-none"
        whileHover={{ z: 20 }}
      >
        <Link href={`/works/${post.id}`}>
          {/* Card image */}
          <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#1C1917]"
            style={{ transform: "translateZ(0)" }}>

            {post.coverImage ? (
              <Image src={post.coverImage} alt={post.title} fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1C1917]">
                <Icon className="w-12 h-12 text-white/20" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Glare highlight */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]) =>
                    `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.08) 0%, transparent 65%)`
                ),
              }}
            />

            {/* Video badge */}
            {post.mediaType === "video" && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5"
                style={{ transform: "translateZ(20px)" }}>
                <Film className="w-3 h-3 text-white" />
                <span className="text-white text-xs">Video</span>
              </div>
            )}

            {/* Featured badge */}
            {post.featured && (
              <div className="absolute top-4 left-4 rounded-full px-3 py-1"
                style={{ backgroundColor: color + "22", border: `1px solid ${color}44`, transform: "translateZ(20px)" }}>
                <span className="text-xs font-semibold" style={{ color }}>Featured</span>
              </div>
            )}

            {/* Bottom hover info */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{ transform: "translateZ(25px)" }}
            >
              <p className="text-white/80 text-xs line-clamp-2">{post.description}</p>
            </motion.div>
          </div>

          {/* Card text — slightly lifted in Z */}
          <div className="mt-4 px-1" style={{ transform: "translateZ(10px)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color }}>{label}</span>
            </div>
            <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-[#CA8A04] transition-colors duration-200">
              {post.title}
            </h3>
            {post.titleAr && (
              <p className="text-white/40 text-sm mt-1 font-light" dir="rtl">{post.titleAr}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-white/30 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}
