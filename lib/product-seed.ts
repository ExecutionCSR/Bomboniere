import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { baseProducts } from "@/data/products";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureSeedProducts() {
  const count = await prisma.product.count();
  if (count > 0) {
    return;
  }

  await prisma.product.createMany({
    data: baseProducts.map((product) => ({
      slug: slugify(product.id || product.name),
      code: product.code,
      name: product.name,
      category: product.category,
      price: new Prisma.Decimal(product.price),
      availableQuantity: product.availableQuantity,
      description: product.description,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
    })),
  });
}
