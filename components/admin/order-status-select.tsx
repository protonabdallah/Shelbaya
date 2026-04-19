"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/30 text-xs">Status:</span>
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs focus:outline-none focus:border-[#7C3AED]/50 cursor-pointer disabled:opacity-50 capitalize"
      >
        {STATUSES.map(s => (
          <option key={s} value={s} className="bg-[#1C1917] capitalize">{s}</option>
        ))}
      </select>
    </div>
  );
}
