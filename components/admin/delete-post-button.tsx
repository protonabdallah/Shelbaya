"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeletePostButton({ postId }: { postId: number }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }

    setLoading(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`p-2 rounded-lg transition-all cursor-pointer ${
        confirm
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "text-white/40 hover:text-red-400 hover:bg-red-500/10"
      }`}
      title={confirm ? "Click again to confirm" : "Delete post"}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
