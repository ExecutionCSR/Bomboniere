"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog/catalog-context";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { storeConfig } from "@/data/store";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Home() {
  const { products, isLoading, error, refreshProducts } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const uniqueCategories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const prices = products.map((product) => product.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <main className="page-shell">
      {error ? (
        <section className="db-warning-card">
          <strong>Banco ainda nao configurado.</strong>
          <p>Preencha o <code>.env.local</code> com a URL do Supabase e rode a migration inicial.</p>
          <div className="admin-form-actions">
            <button type="button" className="buy-button" onClick={() => void refreshProducts()}>
              Tentar novamente
            </button>
            <Link href="/admin/produtos" className="secondary-link">
              Abrir admin
            </Link>
          </div>
        </section>
      ) : null}

      <section className="catalog-header">
        <div className="catalog-title-row">
          <div>
            <span className="eyebrow">{storeConfig.name}</span>
            <h1>Vitrine de produtos</h1>
            <p>Escolha por nome ou categoria e navegue direto pelo catalogo da loja.</p>
          </div>
          <div className="header-side">
            <Link href="/admin/produtos" className="secondary-link admin-link">
              Area admin
            </Link>
            <div className="hero-card compact">
              <p className="hero-card-label">Resumo inicial</p>
              <strong>{isLoading ? "..." : `${products.length} produtos`}</strong>
              <span>{uniqueCategories.length} categorias</span>
              <span>A partir de {currency.format(lowestPrice)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="filters-panel" aria-label="Filtros da vitrine">
        <label className="filter-field">
          <span>Buscar por nome</span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex.: pacoca, coca-cola, chiclete"
          />
        </label>

        <label className="filter-field">
          <span>Categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="Todos">Todas</option>
            {uniqueCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="clear-filters-button"
          onClick={() => {
            setSearch("");
            setCategory("Todos");
          }}
        >
          Limpar filtros
        </button>
      </section>

      <section className="category-tabs" aria-label="Atalhos por categoria">
        <button
          type="button"
          className={`category-tab${category === "Todos" ? " active" : ""}`}
          onClick={() => setCategory("Todos")}
        >
          Todas
        </button>
        {uniqueCategories.map((item) => (
          <button
            key={item}
            type="button"
            className={`category-tab${category === item ? " active" : ""}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="products-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Catalogo</span>
            <h2>Produtos da loja</h2>
          </div>
          <p>
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"} encontrado
            {filteredProducts.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <Link href={`/produtos/${product.id}`} className="product-link-card">
                <div className="product-badge-row">
                  <span className="product-category">{product.category}</span>
                  <span className="product-code">Cod. {product.code}</span>
                </div>

                <div className="product-visual">
                  <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
                </div>

                <div className="product-content">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <span className={`stock-badge${product.availableQuantity === 0 ? " empty" : ""}`}>
                    {product.availableQuantity === 0
                      ? "Sem estoque"
                      : `${product.availableQuantity} disponivel${product.availableQuantity === 1 ? "" : "eis"}`}
                  </span>
                </div>
              </Link>

              <div className="product-footer">
                <div className="price-block">
                  <span className="price-label">Preco</span>
                  <strong className="price-value">{currency.format(product.price)}</strong>
                </div>
                <AddToCartButton
                  productId={product.id}
                  className="buy-button"
                  disabled={product.availableQuantity === 0}
                  label={product.availableQuantity === 0 ? "Indisponivel" : "Comprar"}
                />
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum produto encontrado.</strong>
            <p>Tente buscar outro nome ou limpar o filtro de categoria.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
