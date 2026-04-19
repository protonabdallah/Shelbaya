"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteMessageButton({ messageId }: { messageId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this message?")) return;

    setLoading(true);
    await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-red-400/60 hover:text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
      title="Delete message"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}