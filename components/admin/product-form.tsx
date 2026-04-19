"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import Link from "next/link";

interface ProductFormData {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  oldPrice: string;
  stock: string;
  category: string;
  brand: string;
  images: string;
  featured: boolean;
  published: boolean;
}

const CATEGORIES = ["laptops", "desktops", "gaming", "peripherals", "monitors", "components", "accessories", "networking"];

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: number;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    oldPrice: "",
    stock: "0",
    category: "laptops",
    brand: "",
    images: "",
    featured: false,
    published: true,
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Parse current images array from JSON string
  const getImageList = (): string[] => {
    try { return JSON.parse(form.images) as string[]; } catch { return []; }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const current = getImageList();
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json() as { url?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        uploaded.push(data.url!);
      }
      setForm(prev => ({ ...prev, images: JSON.stringify([...current, ...uploaded]) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    const updated = getImageList().filter(u => u !== url);
    setForm(prev => ({ ...prev, images: updated.length ? JSON.stringify(updated) : "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof ProductFormData, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        {field("name",    "Product Name (EN)",  "text", "e.g. Dell XPS 15")}
        {field("nameAr",  "Product Name (AR)",  "text", "اسم المنتج")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">Description (EN)</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">Description (AR)</label>
          <textarea name="descriptionAr" value={form.descriptionAr} onChange={handleChange} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 text-sm resize-none" dir="rtl" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {field("price",    "Price (JD)",  "number", "0.00")}
        {field("oldPrice", "Old Price (JD)", "number", "0.00")}
        {field("stock",    "Stock",      "number", "0")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">Category</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED]/50 text-sm cursor-pointer capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1C1917] capitalize">{c}</option>)}
          </select>
        </div>
        {field("brand", "Brand", "text", "e.g. Dell, HP, ASUS")}
      </div>
      <div>
        <label className="block text-white/60 text-xs uppercase tracking-wider mb-3">Product Images</label>
        {/* Image previews */}
        {getImageList().length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {getImageList().map((url, i) => (
              <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`product-${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-white/60 hover:text-white text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-[#7C3AED]" />
          <span className="text-white/60 text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="w-4 h-4 accent-[#7C3AED]" />
          <span className="text-white/60 text-sm">Published</span>
        </label>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {productId ? "Save Changes" : "Create Product"}
        </button>
        <Link href="/admin/products" className="text-white/40 hover:text-white text-sm transition-colors">Cancel</Link>
      </div>
    </form>
  );
}
