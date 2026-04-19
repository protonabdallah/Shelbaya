"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteOrderButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this order and restore its stock quantities?")) return;

    setLoading(true);
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-red-400/60 hover:text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-all cursor-pointer flex items-center gap-1"
      title="Delete order"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>Delete</span>
    </button>
  );
}