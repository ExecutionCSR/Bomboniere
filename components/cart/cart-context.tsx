"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "@/components/catalog/catalog-context";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "bomboniere-da-van-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedItems) {
      return;
    }

    try {
      const parsed = JSON.parse(storedItems) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (productId: string) => {
    setItems((current) => {
      const product = products.find((item) => item.id === productId);
      if (!product || product.availableQuantity <= 0) {
        return current;
      }

      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.availableQuantity) {
          return current;
        }

        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { productId, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const increaseItem = (productId: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const product = products.find((entry) => entry.id === productId);
        if (!product || item.quantity >= product.availableQuantity) {
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      }),
    );
  };

  const decreaseItem = (productId: string) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (item.quantity === 1) {
          return [];
        }

        return { ...item, quantity: item.quantity - 1 };
      }),
    );
  };

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      increaseItem,
      decreaseItem,
      clearCart: () => setItems([]),
    }),
    [isOpen, items, products],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

export function useCartSummary() {
  const { items } = useCart();
  const { products } = useCatalog();

  return useMemo(() => {
    const detailedItems = items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) {
          return null;
        }

        return {
          ...item,
          product,
          subtotal: product.price * item.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const totalItems = detailedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return { detailedItems, totalItems, totalPrice };
  }, [items, products]);
}
