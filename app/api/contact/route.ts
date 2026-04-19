import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim();
    const phone = body?.phone?.trim();
    const message = body?.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
