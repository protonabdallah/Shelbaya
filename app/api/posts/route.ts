import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured  = searchParams.get("featured");
  const section   = searchParams.get("section"); // filter by display section
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const skip  = (page - 1) * limit;

  const where: Record<string, unknown> = { published: true };
  if (category && category !== "all") where.category = category;
  if (featured === "true") where.featured = true;
  // SQLite stores sections as JSON string — use contains to match section ID
  if (section) where.sections = { contains: `"${section}"` };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(request: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...data } = body;
  const post = await prisma.post.create({ data });
  return NextResponse.json(post, { status: 201 });
}
