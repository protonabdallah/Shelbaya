import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true, nameAr: true } } } } },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerEmail, customerPhone, customerAddress, city, notes, items } = body;

  if (!customerName || !customerPhone || !customerAddress || !city || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Use a transaction to create order and decrement stock atomically
  const result = await prisma.$transaction(async (tx) => {
    // Verify stock for all items
    for (const item of items as { productId: number; quantity: number; price: number }[]) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    }

    // Calculate total
    const total = (items as { productId: number; quantity: number; price: number }[]).reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    );

    // Create order
    const order = await tx.order.create({
      data: {
        customerName,
        customerEmail: customerEmail ?? null,
        customerPhone,
        customerAddress,
        city,
        notes: notes ?? null,
        total,
        items: {
          create: (items as { productId: number; quantity: number; price: number }[]).map(i => ({
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.price,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items as { productId: number; quantity: number }[]) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });

  return NextResponse.json({ order: result }, { status: 201 });
}
