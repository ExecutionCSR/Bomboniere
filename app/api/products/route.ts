import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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

  try {
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "";

      if (target.includes("code")) {
        return NextResponse.json(
          { error: "Ja existe um produto com esse codigo. Use outro codigo." },
          { status: 409 },
        );
      }

      if (target.includes("slug")) {
        return NextResponse.json(
          { error: "Ja existe um produto com esse nome base. Ajuste o nome do produto." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ error: "Falha ao cadastrar produto." }, { status: 500 });
  }
}
