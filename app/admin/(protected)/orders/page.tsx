import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending:    "bg-yellow-500/20 text-yellow-400",
  confirmed:  "bg-blue-500/20 text-blue-400",
  processing: "bg-purple-500/20 text-purple-400",
  shipped:    "bg-teal-500/20 text-teal-400",
  delivered:  "bg-green-500/20 text-green-400",
  cancelled:  "bg-red-500/20 text-red-400",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-white/40 text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {orders.map(order => (
            <div key={order.id} className="p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">#{order.id} — {order.customerName}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColors[order.status] ?? "bg-white/10 text-white/50"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    {order.customerPhone} · {order.customerAddress}, {order.city}
                    {order.customerEmail && ` · ${order.customerEmail}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#7C3AED] font-bold">${order.total.toFixed(2)}</p>
                  <p className="text-white/30 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pl-0 space-y-1">
                {order.items.map(item => (
                  <p key={item.id} className="text-white/50 text-xs">
                    {item.product.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>

              {order.notes && (
                <p className="text-white/30 text-xs italic">Note: {order.notes}</p>
              )}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                <DeleteOrderButton orderId={order.id} />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-white/30 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
