import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name         !== undefined) data.name         = body.name;
  if (body.nameAr       !== undefined) data.nameAr       = body.nameAr;
  if (body.description  !== undefined) data.description  = body.description;
  if (body.descriptionAr!== undefined) data.descriptionAr= body.descriptionAr;
  if (body.price        !== undefined) data.price        = parseFloat(body.price);
  if (body.oldPrice     !== undefined) data.oldPrice     = body.oldPrice ? parseFloat(body.oldPrice) : null;
  if (body.stock        !== undefined) data.stock        = parseInt(body.stock);
  if (body.category     !== undefined) data.category     = body.category;
  if (body.brand        !== undefined) data.brand        = body.brand;
  if (body.images       !== undefined) data.images       = body.images;
  if (body.featured     !== undefined) data.featured     = body.featured;
  if (body.published    !== undefined) data.published    = body.published;

  const product = await prisma.product.update({ where: { id: parseInt(id) }, data });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
