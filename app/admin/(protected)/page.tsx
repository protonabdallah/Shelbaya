import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, Clock, CheckCircle, PlusCircle, Truck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, pendingOrders, shippedOrders, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { published: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
    ]);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package,       color: "#7C3AED" },
    { label: "Total Orders",   value: totalOrders,   icon: ShoppingBag,   color: "#A855F7" },
    { label: "Pending",        value: pendingOrders, icon: Clock,         color: "#F59E0B" },
    { label: "Shipped",        value: shippedOrders, icon: Truck,         color: "#10B981" },
  ];

  const statusColors: Record<string, string> = {
    pending:    "bg-yellow-500/20 text-yellow-400",
    confirmed:  "bg-blue-500/20 text-blue-400",
    processing: "bg-purple-500/20 text-purple-400",
    shipped:    "bg-teal-500/20 text-teal-400",
    delivered:  "bg-green-500/20 text-green-400",
    cancelled:  "bg-red-500/20 text-red-400",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Shelbaya For Computers â€” Admin</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color + "20" }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-white/40 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[#7C3AED] text-sm hover:text-[#A855F7] transition-colors cursor-pointer">View All</Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-4 p-5 hover:bg-white/3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{order.customerName}</p>
                <p className="text-white/40 text-xs">{order.city} Â· {order.items.length} items Â· ${order.total.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[order.status] ?? "bg-white/10 text-white/50"}`}>
                  {order.status}
                </span>
                <Link href={`/admin/orders`} className="px-3 py-1.5 text-white/50 hover:text-white text-xs rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                  View
                </Link>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-white/30 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}


