"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCatalog } from "@/components/catalog/catalog-context";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const { products } = useCatalog();
  const product = products.find((entry) => entry.id === params.id);

  if (!product) {
    return (
      <main className="page-shell product-page">
        <Link href="/" className="back-link">
          Voltar para a vitrine
        </Link>
        <div className="empty-state">
          <strong>Produto nao encontrado.</strong>
          <p>Esse item pode ter sido removido ou alterado na area admin.</p>
        </div>
      </main>
    );
  }

  const relatedProducts = products
    .filter((entry) => entry.category === product.category && entry.id !== product.id)
    .slice(0, 4);

  return (
    <main className="page-shell product-page">
      <Link href="/" className="back-link">
        Voltar para a vitrine
      </Link>

      <section className="product-hero">
        <div className="product-gallery">
          <img src={product.imageUrl} alt={product.imageAlt} />
        </div>

        <div className="product-info-card">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

          <div className="product-meta-grid">
            <article>
              <span>Codigo</span>
              <strong>{product.code}</strong>
            </article>
            <article>
              <span>Preco</span>
              <strong>{currency.format(product.price)}</strong>
            </article>
            <article>
              <span>Estoque</span>
              <strong>{product.availableQuantity}</strong>
            </article>
          </div>

          <div className="product-page-actions">
            <AddToCartButton
              productId={product.id}
              label={product.availableQuantity === 0 ? "Indisponivel" : "Adicionar ao carrinho"}
              className="buy-button product-buy-button"
              disabled={product.availableQuantity === 0}
            />
            <Link href="/" className="secondary-link">
              Continuar comprando
            </Link>
          </div>
        </div>
      </section>

      <section className="related-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Mais opcoes</span>
            <h2>Produtos parecidos</h2>
          </div>
        </div>

        <div className="products-grid">
          {relatedProducts.map((item) => (
            <article key={item.id} className="product-card">
              <Link href={`/produtos/${item.id}`} className="product-link-card">
                <div className="product-badge-row">
                  <span className="product-category">{item.category}</span>
                  <span className="product-code">Cod. {item.code}</span>
                </div>
                <div className="product-visual">
                  <img src={item.imageUrl} alt={item.imageAlt} loading="lazy" />
                </div>
                <div className="product-content">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className={`stock-badge${item.availableQuantity === 0 ? " empty" : ""}`}>
                    {item.availableQuantity === 0 ? "Sem estoque" : `${item.availableQuantity} disponiveis`}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
