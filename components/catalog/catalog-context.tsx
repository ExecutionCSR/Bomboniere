"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const hasBootstrappedRef = useRef(false);

  const refreshProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;
    void refreshProducts();
  }, [refreshProducts]);

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
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Falha ao cadastrar produto.");
        }

        const createdProduct = (await response.json()) as CatalogProduct;
        setProducts((current) =>
          [...current, createdProduct].sort((left, right) => left.code - right.code),
        );
      },
      updateProduct: async (productId: string, product: CatalogInput) => {
        const response = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Falha ao atualizar produto.");
        }

        const updatedProduct = (await response.json()) as CatalogProduct;
        setProducts((current) =>
          current
            .map((item) => (item.id === productId ? updatedProduct : item))
            .sort((left, right) => left.code - right.code),
        );
      },
      removeProduct: async (productId: string) => {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Falha ao remover produto.");
        }

        setProducts((current) => current.filter((item) => item.id !== productId));
      },
    }),
    [products, isLoading, error, refreshProducts],
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
