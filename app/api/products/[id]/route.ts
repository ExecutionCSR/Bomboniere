import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: slugify(body.name),
      code: Number(body.code),
      name: body.name,
      category: body.category,
      price: new Prisma.Decimal(body.price),
      availableQuantity: Number(body.availableQuantity),
      description: body.description,
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt,
    },
  });

  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
