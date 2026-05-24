import type { Order, OrderItem, Product } from "@prisma/client";

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    code: product.code,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    availableQuantity: product.availableQuantity,
    description: product.description,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
  };
}

export function serializeOrder(
  order: Order & {
    items: OrderItem[];
  },
) {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
  };
}
