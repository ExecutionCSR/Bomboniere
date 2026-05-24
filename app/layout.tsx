import type { Metadata } from "next";
import { CatalogProvider } from "@/components/catalog/catalog-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { OrdersProvider } from "@/components/orders/orders-context";
import { CartProvider } from "@/components/cart/cart-context";
import { storeConfig } from "@/data/store";
import "./globals.css";

export const metadata: Metadata = {
  title: storeConfig.name,
  description: "Loja online de doces, bebidas e guloseimas."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CatalogProvider>
          <OrdersProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </OrdersProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
