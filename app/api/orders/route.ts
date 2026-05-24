import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export async function GET() {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = await prisma.$transaction(async (tx) => {
    const ids = body.items.map((item: { productId: string }) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids } },
    });

    for (const item of body.items) {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product || product.availableQuantity < item.quantity) {
        throw new Error(`Sem estoque para ${item.productName}`);
      }
    }

    const order = await tx.order.create({
      data: {
        customerName: body.customerName ?? "",
        customerPhone: body.customerPhone ?? "",
        paymentMethod: body.paymentMethod,
        notes: body.notes ?? "",
        totalPrice: new Prisma.Decimal(body.totalPrice),
        items: {
          create: body.items.map(
            (item: {
              productId: string;
              productName: string;
              unitPrice: number;
              quantity: number;
              subtotal: number;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              quantity: item.quantity,
              subtotal: new Prisma.Decimal(item.subtotal),
            }),
          ),
        },
      },
      include: { items: true },
    });

    for (const item of body.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          availableQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  });

  return NextResponse.json(serializeOrder(result), { status: 201 });
}
