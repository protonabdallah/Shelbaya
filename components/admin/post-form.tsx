"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, ImagePlus, PlayCircle, X, Upload, Loader2,
  Star, Globe, GripVertical, Plus, Film, Home, List, Layout, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GalleryItem {
  url: string;
  type: "image" | "video"; // video = YouTube URL
  caption: string;
}

// ─── Section definitions ──────────────────────────────────────────────────────
export const SITE_SECTIONS = [
  {
    id: "home_featured",
    label: "Homepage — Featured Works",
    labelAr: "الصفحة الرئيسية — قسم الأعمال",
    icon: "Home",
    description: "Appears in the Featured Works grid on the homepage",
    color: "#CA8A04",
  },
  {
    id: "works_page",
    label: "Works Page (/works)",
    labelAr: "صفحة الأعمال",
    icon: "List",
    description: "Appears in the main works listing page",
    color: "#0EA5E9",
  },
] as const;

export type SectionId = typeof SITE_SECTIONS[number]["id"];

function parseSections(raw: string | string[] | undefined): SectionId[] {
  if (!raw) return ["home_featured", "works_page"];
  if (Array.isArray(raw)) return raw as SectionId[];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ["home_featured", "works_page"];
  } catch { return ["home_featured", "works_page"]; }
}

interface PostFormData {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  tags: string;
  coverImage: string;
  mediaUrl: string;
  mediaType: string;
  gallery: GalleryItem[];
  sections: SectionId[];
  featured: boolean;
  published: boolean;
}

interface PostFormProps {
  initialData?: Partial<Omit<PostFormData, "gallery" | "sections"> & {
    gallery?: string | GalleryItem[];
    sections?: string | SectionId[];
    id?: number;
  }>;
  mode: "create" | "edit";
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function parseGallery(raw: string | GalleryItem[] | undefined): GalleryItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PostForm({ initialData, mode }: PostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mediaMode, setMediaMode] = useState<"image" | "video">(
    initialData?.mediaType === "video" ? "video" : "image"
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? "",
    titleAr: initialData?.titleAr ?? "",
    description: initialData?.description ?? "",
    descriptionAr: initialData?.descriptionAr ?? "",
    category: initialData?.category ?? "photography",
    tags: initialData?.tags ?? "",
    coverImage: initialData?.coverImage ?? "",
    mediaUrl: initialData?.mediaUrl ?? "",
    mediaType: initialData?.mediaType ?? "image",
    gallery: parseGallery(initialData?.gallery),
    sections: parseSections(initialData?.sections),
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? true,
  });

  const update = (field: keyof PostFormData, value: string | boolean | GalleryItem[] | SectionId[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  function toggleSection(id: SectionId) {
    const has = form.sections.includes(id);
    update("sections", has ? form.sections.filter((s) => s !== id) : [...form.sections, id]);
  }

  // ─── Upload helper ──────────────────────────────────────────────────────────
  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) { setError((await res.json()).error ?? "Upload failed"); return null; }
    return (await res.json()).url;
  }

  async function handleCoverFile(file: File) {
    setUploadingCover(true); setError("");
    const url = await uploadFile(file);
    if (url) update("coverImage", url);
    setUploadingCover(false);
  }

  async function handleMainImageFile(file: File) {
    setUploadingImage(true); setError("");
    const url = await uploadFile(file);
    if (url) {
      update("mediaUrl", url);
      if (!form.coverImage) update("coverImage", url);
      update("mediaType", "image");
    }
    setUploadingImage(false);
  }

  // ─── Gallery helpers ────────────────────────────────────────────────────────
  async function handleGalleryFiles(files: FileList) {
    setUploadingGallery(true); setError("");
    const newItems: GalleryItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = await uploadFile(file);
      if (url) newItems.push({ url, type: "image", caption: "" });
    }
    update("gallery", [...form.gallery, ...newItems]);
    setUploadingGallery(false);
  }

  function addGalleryVideo() {
    const id = getYouTubeId(newVideoUrl);
    if (!id) { setError("Invalid YouTube URL"); return; }
    update("gallery", [...form.gallery, { url: newVideoUrl, type: "video", caption: "" }]);
    setNewVideoUrl("");
  }

  function removeGalleryItem(i: number) {
    update("gallery", form.gallery.filter((_, idx) => idx !== i));
  }

  function updateGalleryCaption(i: number, caption: string) {
    const next = form.gallery.map((item, idx) => idx === i ? { ...item, caption } : item);
    update("gallery", next);
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const payload = {
      ...form,
      mediaType: mediaMode,
      gallery: JSON.stringify(form.gallery),
      sections: JSON.stringify(form.sections),
    };
    const url = mode === "create" ? "/api/posts" : `/api/posts/${initialData?.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSuccess(true);
      if (mode === "create") router.push("/admin/posts");
      else { router.refresh(); setTimeout(() => setSuccess(false), 2500); }
    } else {
      setError((await res.json()).error ?? "Something went wrong");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#CA8A04]/50 transition-all text-sm";
  const labelClass = "block text-white/60 text-xs tracking-widest uppercase mb-2";
  const ytId = mediaMode === "video" ? getYouTubeId(form.mediaUrl) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {mode === "create" ? "Post created!" : "Saved!"}
        </div>
      )}

      {/* ── Status bar: Featured + Published ── */}
      <div className="flex flex-wrap gap-4 p-5 rounded-2xl bg-white/3 border border-white/8">
        {/* Featured toggle */}
        <button
          type="button"
          onClick={() => update("featured", !form.featured)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all border cursor-pointer ${
            form.featured
              ? "bg-[#CA8A04]/15 border-[#CA8A04]/50 text-[#CA8A04]"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          <Star className={`w-4 h-4 ${form.featured ? "fill-[#CA8A04]" : ""}`} />
          Featured Post
        </button>

        {/* Published toggle */}
        <button
          type="button"
          onClick={() => update("published", !form.published)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all border cursor-pointer ${
            form.published
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          <Globe className="w-4 h-4" />
          {form.published ? "Published" : "Draft"}
        </button>
      </div>

      {/* ── Display Sections ── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Layout className="w-4 h-4 text-[#CA8A04]" />
            <span className="text-white text-sm font-semibold tracking-wide">Display Sections</span>
          </div>
          <span className="text-white/35 text-xs">
            {form.sections.length === 0
              ? "Hidden everywhere"
              : `${form.sections.length} section${form.sections.length > 1 ? "s" : ""} selected`}
          </span>
        </div>

        {/* Section cards */}
        <div className="divide-y divide-white/5">
          {SITE_SECTIONS.map((sec) => {
            const active = form.sections.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => toggleSection(sec.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 cursor-pointer
                  ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
              >
                {/* Toggle circle */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${active ? "border-transparent" : "border-white/20"}`}
                  style={active ? { backgroundColor: sec.color } : {}}
                >
                  {active && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${active ? "text-white" : "text-white/50"}`}>
                    {sec.label}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{sec.labelAr}</p>
                  <p className="text-white/25 text-xs mt-0.5">{sec.description}</p>
                </div>

                {/* Active badge */}
                {active ? (
                  <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: sec.color + "22", color: sec.color }}>
                    Visible
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-xs text-white/20 px-2.5 py-1 rounded-full bg-white/5">
                    Hidden
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Warning if hidden everywhere */}
        {form.sections.length === 0 && (
          <div className="px-5 py-3 bg-orange-500/10 border-t border-orange-500/20 flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-orange-400 text-xs">
              This post is hidden from all sections. It won&apos;t appear anywhere on the site.
            </p>
          </div>
        )}
      </div>

      {/* ── Titles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Title (English)</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
            placeholder="Post title..." required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title (Arabic)</label>
          <input type="text" value={form.titleAr} onChange={(e) => update("titleAr", e.target.value)}
            placeholder="عنوان المنشور..." className={`${inputClass} text-right`} dir="rtl" />
        </div>
      </div>

      {/* ── Descriptions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Description (English)</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
            placeholder="Describe this work..." rows={4} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>Description (Arabic)</label>
          <textarea value={form.descriptionAr} onChange={(e) => update("descriptionAr", e.target.value)}
            placeholder="وصف العمل..." rows={4} className={`${inputClass} resize-none text-right`} dir="rtl" />
        </div>
      </div>

      {/* ── Category + Tags ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Category</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)}
            className={`${inputClass} bg-[#1C1917] cursor-pointer`}>
            <option value="photography">Photography</option>
            <option value="videography">Videography</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)}
            placeholder="landscape, nature, sunset" className={inputClass} />
        </div>
      </div>

      {/* ── Cover Image ── */}
      <div>
        <label className={labelClass}>Cover Image <span className="text-red-400">*</span></label>
        <p className="text-white/30 text-xs mb-3">Main image shown in cards and at the top of the post</p>
        <input ref={coverFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); e.target.value = ""; }} />
        {form.coverImage ? (
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 max-h-64">
            <img src={form.coverImage} alt="Cover" className="w-full max-h-64 object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => coverFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#CA8A04] text-black rounded-lg text-sm font-semibold hover:bg-[#B45309]">
                <Upload className="w-4 h-4" /> Change
              </button>
              <button type="button" onClick={() => update("coverImage", "")}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm">
                <X className="w-4 h-4" /> Remove
              </button>
            </div>
            {uploadingCover && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA8A04]" />
              </div>
            )}
          </div>
        ) : (
          <div onClick={() => coverFileRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-[#CA8A04]/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#CA8A04]/5">
            {uploadingCover ? (
              <div className="flex flex-col items-center gap-2 text-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA8A04]" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/20" />
                <p className="text-white/50 text-sm">Click to upload cover image</p>
                <p className="text-white/25 text-xs">JPG, PNG, WebP — max 10 MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main Media (Image or YouTube Video) ── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/3">
          <GripVertical className="w-4 h-4 text-white/20" />
          <span className="text-white/70 text-sm font-medium">Main Media</span>
          <span className="text-white/30 text-xs ml-auto">Image upload or YouTube video</span>
        </div>

        <div className="grid grid-cols-2 border-b border-white/10">
          <button type="button" onClick={() => { setMediaMode("image"); update("mediaType", "image"); }}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
              mediaMode === "image" ? "bg-[#CA8A04]/10 text-[#CA8A04] border-b-2 border-[#CA8A04]" : "text-white/40 hover:text-white/70"
            }`}>
            <ImagePlus className="w-4 h-4" /> Image
          </button>
          <button type="button" onClick={() => { setMediaMode("video"); update("mediaType", "video"); }}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
              mediaMode === "video" ? "bg-red-500/10 text-red-400 border-b-2 border-red-500" : "text-white/40 hover:text-white/70"
            }`}>
            <PlayCircle className="w-4 h-4" /> YouTube
          </button>
        </div>

        <div className="p-6">
          {mediaMode === "image" && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainImageFile(f); e.target.value = ""; }} />
              {form.mediaUrl && form.mediaType !== "video" ? (
                <div className="relative group rounded-xl overflow-hidden">
                  <img src={form.mediaUrl} alt="Preview" className="w-full max-h-56 object-cover rounded-xl border border-white/10" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#CA8A04] text-black rounded-lg text-sm font-semibold">
                      <Upload className="w-4 h-4" /> Change
                    </button>
                    <button type="button" onClick={() => update("mediaUrl", "")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm">
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleMainImageFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    dragOver ? "border-[#CA8A04] bg-[#CA8A04]/10" : "border-white/15 hover:border-white/30 hover:bg-white/5"
                  }`}>
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2 text-white/50">
                      <Loader2 className="w-8 h-8 animate-spin text-[#CA8A04]" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-white/30" />
                      </div>
                      <p className="text-white/60 text-sm">Drop image or <span className="text-[#CA8A04] underline underline-offset-2">browse</span></p>
                      <p className="text-white/25 text-xs">JPG, PNG, WebP — max 10 MB</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mediaMode === "video" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>YouTube URL</label>
                <div className="relative">
                  <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/60" />
                  <input type="url" value={form.mediaUrl} onChange={(e) => update("mediaUrl", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..." className={`${inputClass} pl-11`} />
                </div>
              </div>
              {ytId && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                  <iframe src={`https://www.youtube.com/embed/${ytId}`} className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}
              <div>
                <label className={labelClass}>Cover Thumbnail</label>
                <input ref={coverFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); e.target.value = ""; }} />
                <div className="flex gap-3">
                  <input type="url" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)}
                    placeholder="https://... or upload" className={`${inputClass} flex-1`} />
                  <button type="button" onClick={() => coverFileRef.current?.click()} disabled={uploadingCover}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all text-sm flex items-center gap-2 shrink-0 disabled:opacity-50">
                    {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery (multiple images / videos) ── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/3">
          <span className="text-white/70 text-sm font-medium">Gallery</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-white/8 text-white/40 text-xs">{form.gallery.length}</span>
          <span className="text-white/30 text-xs ml-auto">Additional images & videos shown in the post</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Existing gallery items */}
          {form.gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {form.gallery.map((item, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/3">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.caption || `Gallery ${i + 1}`}
                      className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-black flex flex-col items-center justify-center gap-2">
                      <Film className="w-8 h-8 text-red-400" />
                      <p className="text-white/50 text-xs text-center px-2 truncate w-full text-center">
                        {getYouTubeId(item.url) ? `YouTube: ${getYouTubeId(item.url)}` : item.url}
                      </p>
                    </div>
                  )}
                  {/* Caption input */}
                  <div className="p-2">
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateGalleryCaption(i, e.target.value)}
                      placeholder="Caption (optional)"
                      className="w-full bg-transparent border-0 border-b border-white/10 text-white/50 text-xs py-1 focus:outline-none focus:border-[#CA8A04]/50 placeholder-white/20"
                    />
                  </div>
                  {/* Remove button */}
                  <button type="button" onClick={() => removeGalleryItem(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add images drag zone */}
          <input ref={galleryFileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleGalleryFiles(e.target.files); e.target.value = ""; }} />
          <div
            onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
            onDragLeave={() => setGalleryDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setGalleryDragOver(false);
              if (e.dataTransfer.files.length) handleGalleryFiles(e.dataTransfer.files);
            }}
            onClick={() => galleryFileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              galleryDragOver ? "border-[#CA8A04] bg-[#CA8A04]/10" : "border-white/10 hover:border-white/25 hover:bg-white/3"
            }`}>
            {uploadingGallery ? (
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Loader2 className="w-5 h-5 animate-spin text-[#CA8A04]" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-white/40">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add images to gallery (multi-select supported)</span>
              </div>
            )}
          </div>

          {/* Add YouTube video to gallery */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <PlayCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/50" />
              <input type="url" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGalleryVideo(); } }}
                placeholder="Add YouTube video URL to gallery..."
                className={`${inputClass} pl-10 text-sm`} />
            </div>
            <button type="button" onClick={addGalleryVideo}
              className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={loading || uploadingImage || uploadingCover || uploadingGallery}
          className="flex items-center gap-2 px-8 py-3 bg-[#CA8A04] hover:bg-[#B45309] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm tracking-wide transition-all hover:scale-105 cursor-pointer">
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
        {mode === "edit" && initialData?.id && (
          <a href={`/works/${initialData.id}`} target="_blank"
            className="flex items-center gap-2 px-6 py-3 border border-white/15 text-white/60 hover:text-white rounded-xl text-sm transition-all cursor-pointer">
            <Eye className="w-4 h-4" /> Preview
          </a>
        )}
      </div>
    </form>
  );
}
