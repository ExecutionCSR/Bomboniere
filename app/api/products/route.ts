import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ensureSeedProducts } from "@/lib/product-seed";
import { serializeProduct } from "@/lib/serializers";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  await ensureSeedProducts();
  const products = await prisma.product.findMany({
    orderBy: { code: "asc" },
  });

  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request: Request) {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const product = await prisma.product.create({
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

  return NextResponse.json(serializeProduct(product), { status: 201 });
}
