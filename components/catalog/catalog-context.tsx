"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CatalogProduct = {
  id: string;
  slug: string;
  code: number;
  name: string;
  category: "Doces" | "Chicletes" | "Chocolate" | "Salgadinhos" | "Bebidas";
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type CatalogInput = Omit<CatalogProduct, "id" | "slug">;

type CatalogContextValue = {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  createProduct: (product: CatalogInput) => Promise<void>;
  updateProduct: (productId: string, product: CatalogInput) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Nao foi possivel carregar os produtos.");
      }

      const data = (await response.json()) as CatalogProduct[];
      setProducts(data);
    } catch (err) {
      setProducts([]);
      setError(err instanceof Error ? err.message : "Falha ao conectar com o banco.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  }, []);

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error,
      refreshProducts,
      createProduct: async (product: CatalogInput) => {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error("Falha ao cadastrar produto.");
        }

        await refreshProducts();
      },
      updateProduct: async (productId: string, product: CatalogInput) => {
        const response = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar produto.");
        }

        await refreshProducts();
      },
      removeProduct: async (productId: string) => {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Falha ao remover produto.");
        }

        await refreshProducts();
      },
    }),
    [products, isLoading, error],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }

  return context;
}
