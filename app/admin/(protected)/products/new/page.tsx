import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">New Product</h1>
      <p className="text-white/40 text-sm mb-8">Add a new product to the store</p>
      <ProductForm />
    </div>
  );
}
