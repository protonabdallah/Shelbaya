import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Pencil, Package } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          New Product
        </Link>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {products.map(p => {
            const images = p.images ? JSON.parse(p.images) : [];
            return (
              <div key={p.id} className="flex items-center gap-4 p-5 hover:bg-white/3 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#1C1917] overflow-hidden flex-shrink-0">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-white/10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{p.name}</p>
                  <p className="text-white/40 text-xs capitalize">{p.category} · {p.brand ?? "—"} · ${p.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.stock > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    Stock: {p.stock}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${p.published ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"}`}>
                    {p.published ? "Live" : "Draft"}
                  </span>
                  {p.featured && (
                    <span className="px-2 py-1 rounded-full text-xs bg-[#7C3AED]/20 text-[#A855F7]">Featured</span>
                  )}
                  <Link href={`/admin/products/${p.id}/edit`} className="px-3 py-1.5 text-white/50 hover:text-white text-xs rounded-lg hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Link>
                  <DeleteProductButton id={p.id} />
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="p-8 text-center text-white/30 text-sm">No products yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
