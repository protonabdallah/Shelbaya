import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { ArrowLeft, Calendar, Tag, Camera, Film, Heart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categoryIcons = { photography: Camera, videography: Film, volunteer: Heart };
const categoryColors = { photography: "#CA8A04", videography: "#0EA5E9", volunteer: "#10B981" };

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

interface GalleryItem { url: string; type: "image" | "video"; caption?: string; }

function parseGallery(raw: string | null | undefined): GalleryItem[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
  if (!post || !post.published) notFound();

  const Icon = categoryIcons[post.category as keyof typeof categoryIcons] ?? Camera;
  const color = categoryColors[post.category as keyof typeof categoryColors] ?? "#CA8A04";
  const gallery = parseGallery(post.gallery);
  const tags = post.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  const ytId = post.mediaType === "video" ? getYouTubeId(post.mediaUrl ?? "") : null;

  const relatedPosts = await prisma.post.findMany({
    where: { published: true, category: post.category, id: { not: post.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-[#0C0A09]">
      <Navigation />

      {/* Back */}
      <div className="fixed top-6 left-6 z-[100]">
        <Link href="/works" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Hero */}
      {post.coverImage && (
        <div className="relative w-full h-[70vh] overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0C0A09]" />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pb-16 -mt-20 relative z-10">

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: color + "20", color }}>
            <Icon className="w-4 h-4" />
            <span className="capitalize">{post.category}</span>
          </div>
          {post.featured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: color + "20", border: `1px solid ${color}50`, color }}>
              <Star className="w-3 h-3 fill-current" /> Featured
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-3">{post.title}</h1>
        {post.titleAr && (
          <p className="text-white/40 text-2xl font-light mb-8" dir="rtl">{post.titleAr}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-6 text-white/40 text-sm mb-10 pb-10 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        {/* Main media */}
        {post.mediaType === "video" && ytId ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 mb-10">
            <iframe src={`https://www.youtube.com/embed/${ytId}`} className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        ) : post.mediaUrl && post.mediaUrl !== post.coverImage ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={post.mediaUrl} alt={post.title} fill className="object-cover" />
          </div>
        ) : null}

        {/* Description */}
        {post.description && (
          <p className="text-white/80 text-lg leading-relaxed mb-6">{post.description}</p>
        )}
        {post.descriptionAr && (
          <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-lg leading-relaxed text-right" dir="rtl">{post.descriptionAr}</p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mt-6 mb-10">
            <Tag className="w-4 h-4 text-white/30" />
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs text-white/50 border border-white/10 hover:border-white/30 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Gallery ── */}
        {gallery.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white uppercase">Gallery</h2>
              <span className="text-white/30 text-sm">{gallery.length} items</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
              {gallery.map((item, i) => (
                <div key={i} className="break-inside-avoid">
                  {item.type === "image" ? (
                    <div className="relative overflow-hidden rounded-2xl group">
                      <Image
                        src={item.url}
                        alt={item.caption || `Gallery image ${i + 1}`}
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white/80 text-xs">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                      <div className="relative w-full aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {item.caption && (
                        <p className="text-white/40 text-xs p-3 border-t border-white/8">{item.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-white/5 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-white uppercase mb-10">
              Related <span style={{ color }}>Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/works/${related.id}`} className="group block rounded-2xl overflow-hidden cursor-pointer">
                  <div className="relative aspect-[4/3] bg-[#1C1917] overflow-hidden">
                    {related.coverImage && (
                      <Image src={related.coverImage} alt={related.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-semibold text-sm line-clamp-2">{related.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
