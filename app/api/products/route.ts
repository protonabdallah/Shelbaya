import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search   = searchParams.get("search");
  const sort     = searchParams.get("sort") ?? "newest";
  const featured = searchParams.get("featured");
  const take     = parseInt(searchParams.get("limit") ?? "100");

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name:        { contains: search } },
      { nameAr:      { contains: search } },
      { brand:       { contains: search } },
      { description: { contains: search } },
    ];
  }

  const orderBy =
    sort === "price_asc"  ? { price: "asc"  as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "featured"   ? { featured: "desc" as const } :
                            { createdAt: "desc" as const };

  const products = await prisma.product.findMany({ where, orderBy, take });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name:          body.name,
      nameAr:        body.nameAr ?? null,
      description:   body.description ?? null,
      descriptionAr: body.descriptionAr ?? null,
      price:         parseFloat(body.price),
      oldPrice:      body.oldPrice ? parseFloat(body.oldPrice) : null,
      stock:         parseInt(body.stock) || 0,
      category:      body.category ?? "accessories",
      brand:         body.brand ?? null,
      images:        body.images ?? null,
      featured:      body.featured ?? false,
      published:     body.published ?? true,
    },
  });
  return NextResponse.json({ product }, { status: 201 });
}
