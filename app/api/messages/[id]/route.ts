import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const messageId = parseInt(id, 10);

  if (Number.isNaN(messageId)) {
    return NextResponse.json({ error: "Invalid message id" }, { status: 400 });
  }

  await prisma.contactMessage.delete({ where: { id: messageId } });
  return NextResponse.json({ success: true });
}