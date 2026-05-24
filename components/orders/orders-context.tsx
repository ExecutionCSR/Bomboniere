"use client";

import {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OrderItem = {
  id?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  notes: string;
  totalPrice: number;
  items: OrderItem[];
};

type NewOrder = Omit<OrderRecord, "id" | "createdAt">;

type OrdersContextValue = {
  orders: OrderRecord[];
  error: string | null;
  refreshOrders: () => Promise<void>;
  createOrder: (order: NewOrder) => Promise<void>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401) {
          setOrders([]);
          return;
        }

        throw new Error("Falha ao carregar pedidos.");
      }

      const data = (await response.json()) as OrderRecord[];
      setOrders(data);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Falha ao conectar com os pedidos.");
    }
  }, []);

  const value = useMemo(
    () => ({
      orders,
      error,
      refreshOrders,
      createOrder: async (order: NewOrder) => {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });

        if (!response.ok) {
          throw new Error("Falha ao registrar pedido.");
        }

        const createdOrder = (await response.json()) as OrderRecord;
        setOrders((current) => [createdOrder, ...current]);
      },
    }),
    [orders, error, refreshOrders],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used within OrdersProvider");
  }

  return context;
}
