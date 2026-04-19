import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) notFound();

  const images = product.images ?? "";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Edit Product</h1>
      <p className="text-white/40 text-sm mb-8">{product.name}</p>
      <ProductForm
        productId={product.id}
        initialData={{
          name:          product.name,
          nameAr:        product.nameAr ?? "",
          description:   product.description ?? "",
          descriptionAr: product.descriptionAr ?? "",
          price:         product.price.toString(),
          oldPrice:      product.oldPrice?.toString() ?? "",
          stock:         product.stock.toString(),
          category:      product.category,
          brand:         product.brand ?? "",
          images,
          featured:      product.featured,
          published:     product.published,
        }}
      />
    </div>
  );
}
