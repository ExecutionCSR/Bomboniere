"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog/catalog-context";
import { useOrders } from "@/components/orders/orders-context";
import { productCategories, type Product } from "@/data/products";

type ProductFormState = {
  code: string;
  name: string;
  category: Product["category"];
  price: string;
  availableQuantity: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

const emptyForm: ProductFormState = {
  code: "",
  name: "",
  category: "Doces",
  price: "",
  availableQuantity: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
};

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function AdminProductsPage() {
  const { products, error: catalogError, createProduct, updateProduct, removeProduct } = useCatalog();
  const { orders, error: ordersError, refreshOrders } = useOrders();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = (await response.json()) as { authenticated: boolean };
      setIsUnlocked(data.authenticated);

      if (data.authenticated) {
        await refreshOrders();
      }
    };

    void bootstrap();
  }, [refreshOrders]);

  const orderedProducts = useMemo(
    () => [...products].sort((a, b) => a.code - b.code),
    [products],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setAuthError("Senha incorreta.");
      return;
    }

    setIsUnlocked(true);
    await refreshOrders();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError("");

    try {
      const payload = {
        code: Number(form.code),
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        availableQuantity: Number(form.availableQuantity),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        imageAlt: form.imageAlt.trim() || form.name.trim(),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Falha ao salvar produto.");
    }
  };

  const startEdit = (product: Product & { id: string }) => {
    setEditingId(product.id);
    setForm({
      code: String(product.code),
      name: product.name,
      category: product.category,
      price: String(product.price),
      availableQuantity: String(product.availableQuantity),
      description: product.description,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsUnlocked(false);
    setPassword("");
  };

  if (!isUnlocked) {
    return (
      <main className="page-shell admin-page">
        <div className="admin-auth-card">
          <span className="eyebrow">Admin</span>
          <h1>Entrar na area administrativa</h1>
          <p>Use a senha definida na variavel de ambiente <code>ADMIN_PASSWORD</code>.</p>

          <form className="admin-auth-form" onSubmit={handleUnlock}>
            <label className="checkout-field">
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha"
              />
            </label>

            {authError ? <p className="auth-error">{authError}</p> : null}

            <div className="admin-form-actions">
              <button type="submit" className="buy-button">
                Entrar
              </button>
              <Link href="/" className="secondary-link">
                Voltar para a loja
              </Link>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell admin-page">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Gerenciar produtos</h1>
          <p>Cadastre, edite estoque e acompanhe o historico de compras da loja.</p>
        </div>
        <div className="header-side">
          <button type="button" className="secondary-link admin-link" onClick={handleLogout}>
            Sair
          </button>
          <Link href="/" className="secondary-link admin-link">
            Voltar para a loja
          </Link>
        </div>
      </div>

      <section className="admin-layout">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">{editingId ? "Edicao" : "Cadastro"}</span>
              <h2>{editingId ? "Editar produto" : "Novo produto"}</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="checkout-field">
              <span>Codigo</span>
              <input
                type="number"
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                required
              />
            </label>

            <label className="checkout-field">
              <span>Categoria</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as Product["category"],
                  }))
                }
              >
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="checkout-field admin-form-full">
              <span>Nome do produto</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>

            <label className="checkout-field">
              <span>Preco</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </label>

            <label className="checkout-field">
              <span>Quantidade disponivel</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.availableQuantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, availableQuantity: event.target.value }))
                }
                required
              />
            </label>

            <label className="checkout-field admin-form-full">
              <span>Descricao</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                required
              />
            </label>

            <label className="checkout-field admin-form-full">
              <span>URL da imagem</span>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                required
              />
            </label>

            <label className="checkout-field admin-form-full">
              <span>Texto alternativo da imagem</span>
              <input
                type="text"
                value={form.imageAlt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageAlt: event.target.value }))
                }
              />
            </label>
          </div>

          {actionError ? <p className="auth-error">{actionError}</p> : null}

          <div className="admin-form-actions">
            <button type="submit" className="buy-button">
              {editingId ? "Salvar alteracoes" : "Cadastrar produto"}
            </button>
            {editingId ? (
              <button type="button" className="clear-filters-button" onClick={resetForm}>
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>

        <section className="admin-list-card">
          {catalogError ? <p className="auth-error">{catalogError}</p> : null}
          <div className="section-heading">
            <div>
              <span className="eyebrow">Catalogo</span>
              <h2>Produtos cadastrados</h2>
            </div>
            <p>{orderedProducts.length} itens</p>
          </div>

          <div className="admin-products-list">
            {orderedProducts.map((product) => (
              <article key={product.id} className="admin-product-row">
                <img src={product.imageUrl} alt={product.imageAlt} />
                <div className="admin-product-content">
                  <strong>{product.name}</strong>
                  <span>
                    Cod. {product.code} • {product.category} • Estoque: {product.availableQuantity}
                  </span>
                  <p>{product.description}</p>
                </div>
                <div className="admin-product-side">
                  <strong>R$ {product.price.toFixed(2)}</strong>
                  <button type="button" className="clear-cart-link" onClick={() => startEdit(product)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="clear-cart-link danger-link"
                    onClick={async () => {
                      await removeProduct(product.id);
                      if (editingId === product.id) {
                        resetForm();
                      }
                    }}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="admin-history-card">
        {ordersError ? <p className="auth-error">{ordersError}</p> : null}
        <div className="section-heading">
          <div>
            <span className="eyebrow">Compras</span>
            <h2>Historico de pedidos</h2>
          </div>
          <p>{orders.length} pedidos</p>
        </div>

        <div className="admin-history-list">
          {orders.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhum pedido registrado ainda.</strong>
              <p>Os pedidos enviados pelo checkout vao aparecer aqui.</p>
            </div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="history-order-card">
                <div className="history-order-top">
                  <div>
                    <strong>{order.customerName || "Cliente sem nome"}</strong>
                    <span>
                      {dateTime.format(new Date(order.createdAt))} • {order.paymentMethod}
                    </span>
                    {order.customerPhone ? <span>{order.customerPhone}</span> : null}
                  </div>
                  <strong className="history-order-total">R$ {order.totalPrice.toFixed(2)}</strong>
                </div>

                <div className="history-items-list">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.id ?? item.productId}`} className="history-item-row">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <strong>R$ {item.subtotal.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {order.notes ? <p className="history-notes">Obs.: {order.notes}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
