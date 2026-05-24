import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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

  try {
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "";

      if (target.includes("code")) {
        return NextResponse.json(
          { error: "Ja existe outro produto com esse codigo. Use outro codigo." },
          { status: 409 },
        );
      }

      if (target.includes("slug")) {
        return NextResponse.json(
          { error: "Ja existe outro produto com esse nome base. Ajuste o nome do produto." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ error: "Falha ao atualizar produto." }, { status: 500 });
  }
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
