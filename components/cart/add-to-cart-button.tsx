"use client";

import { useCatalog } from "@/components/catalog/catalog-context";
import { useCart } from "@/components/cart/cart-context";

export function AddToCartButton({
  productId,
  label = "Comprar",
  className,
  disabled = false,
}: {
  productId: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const { products } = useCatalog();
  const product = products.find((entry) => entry.id === productId);
  const isUnavailable = disabled || !product || product.availableQuantity === 0;

  return (
    <button
      type="button"
      className={className}
      onClick={() => addItem(productId)}
      disabled={isUnavailable}
    >
      {label}
    </button>
  );
}
