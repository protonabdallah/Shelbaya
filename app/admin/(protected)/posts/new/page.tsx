import { PostForm } from "@/components/admin/post-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
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
        <h1 className="text-3xl font-bold text-white">Create New Post</h1>
        <p className="text-white/40 text-sm mt-1">Add a new work to your portfolio</p>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
