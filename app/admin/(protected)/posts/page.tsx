import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Edit2, Camera, Film, Heart, Home, List, EyeOff } from "lucide-react";
import { DeletePostButton } from "@/components/admin/delete-post-button";

export const dynamic = "force-dynamic";

const categoryIcons  = { photography: Camera, videography: Film, volunteer: Heart };
const categoryColors = { photography: "#CA8A04", videography: "#0EA5E9", volunteer: "#10B981" };

const SECTION_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  home_featured: { label: "Home",  color: "#CA8A04", Icon: Home },
  works_page:    { label: "Works", color: "#0EA5E9", Icon: List },
};

function parseSectionsServer(raw: string | null): string[] {
  if (!raw) return ["home_featured", "works_page"];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : ["home_featured", "works_page"]; }
  catch { return ["home_featured", "works_page"]; }
}

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">All Posts</h1>
          <p className="text-white/40 text-sm mt-1">{posts.length} total posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CA8A04] hover:bg-[#B45309] text-black font-semibold rounded-xl text-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/40 text-xs uppercase tracking-widest font-medium">Post</th>
                <th className="text-left p-4 text-white/40 text-xs uppercase tracking-widest font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-4 text-white/40 text-xs uppercase tracking-widest font-medium hidden xl:table-cell">Visible In</th>
                <th className="text-left p-4 text-white/40 text-xs uppercase tracking-widest font-medium hidden lg:table-cell">Date</th>
                <th className="text-left p-4 text-white/40 text-xs uppercase tracking-widest font-medium">Status</th>
                <th className="text-right p-4 text-white/40 text-xs uppercase tracking-widest font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => {
                const Icon = categoryIcons[post.category as keyof typeof categoryIcons] ?? Camera;
                const color = categoryColors[post.category as keyof typeof categoryColors] ?? "#CA8A04";
                return (
                  <tr key={post.id} className="hover:bg-white/3 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1C1917] overflow-hidden flex-shrink-0">
                          {post.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate max-w-[200px]">{post.title}</p>
                          {post.featured && (
                            <span className="text-[#CA8A04] text-xs">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-sm capitalize" style={{ color }}>{post.category}</span>
                      </div>
                    </td>
                    {/* Sections badges */}
                    <td className="p-4 hidden xl:table-cell">
                      {(() => {
                        const secs = parseSectionsServer(post.sections);
                        if (secs.length === 0) return (
                          <span className="flex items-center gap-1 text-orange-400/70 text-xs">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        );
                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {secs.map((sid) => {
                              const m = SECTION_META[sid];
                              if (!m) return null;
                              const SIcon = m.Icon;
                              return (
                                <span key={sid}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                  style={{ backgroundColor: m.color + "18", color: m.color }}>
                                  <SIcon className="w-2.5 h-2.5" />
                                  {m.label}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-white/40 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${
                        post.published ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
