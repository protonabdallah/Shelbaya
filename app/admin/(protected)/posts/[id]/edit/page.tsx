import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) notFound();

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/posts"
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Post</h1>
        <p className="text-white/40 text-sm mt-1 truncate max-w-lg">{post.title}</p>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
        <PostForm
          mode="edit"
          initialData={{
            id: post.id,
            title: post.title,
            titleAr: post.titleAr ?? "",
            description: post.description ?? "",
            descriptionAr: post.descriptionAr ?? "",
            category: post.category,
            tags: post.tags ?? "",
            coverImage: post.coverImage ?? "",
            mediaUrl: post.mediaUrl ?? "",
            mediaType: post.mediaType,
            gallery: post.gallery ?? "",
            sections: post.sections ?? '["home_featured","works_page"]',
            featured: post.featured,
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
