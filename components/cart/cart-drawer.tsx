"use client";

import Link from "next/link";
import { useState } from "react";
import { useCatalog } from "@/components/catalog/catalog-context";
import { useCart, useCartSummary } from "@/components/cart/cart-context";
import { useOrders } from "@/components/orders/orders-context";
import { storeConfig } from "@/data/store";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CartDrawer() {
  const { isOpen, openCart, closeCart, increaseItem, decreaseItem, removeItem, clearCart } =
    useCart();
  const { refreshProducts } = useCatalog();
  const { createOrder } = useOrders();
  const { detailedItems, totalItems, totalPrice } = useCartSummary();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartCheckout = () => {
    if (detailedItems.length === 0) {
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCloseDrawer = () => {
    setCheckoutOpen(false);
    closeCart();
  };

  const handleSendToWhatsApp = async () => {
    if (detailedItems.length === 0 || isSubmitting) {
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    const trimmedNotes = notes.trim();

    const lines = [
      `Ola! Quero fazer um pedido na ${storeConfig.name}.`,
      trimmedName ? `Nome do cliente: ${trimmedName}` : "",
      trimmedPhone ? `Telefone: ${trimmedPhone}` : "",
      `Pagamento: ${paymentMethod}`,
      "",
      "Itens do pedido:",
      ...detailedItems.map(
        (item) =>
          `- ${item.quantity}x ${item.product.name} (${currency.format(item.product.price)}) = ${currency.format(item.subtotal)}`,
      ),
      "",
      `Total: ${currency.format(totalPrice)}`,
      trimmedNotes ? "" : "",
      trimmedNotes ? `Observacoes: ${trimmedNotes}` : "",
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const targetUrl = storeConfig.whatsappNumber
      ? `https://wa.me/${storeConfig.whatsappNumber}?text=${text}`
      : `https://wa.me/?text=${text}`;

    setIsSubmitting(true);

    try {
      await createOrder({
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        paymentMethod,
        notes: trimmedNotes,
        totalPrice,
        items: detailedItems.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          unitPrice: item.product.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      });

      await refreshProducts();
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      clearCart();
      setCheckoutOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("Pix");
      setNotes("");
      closeCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="cart-trigger" onClick={openCart}>
        Carrinho
        <span>{totalItems}</span>
      </button>

      <div className={`cart-overlay${isOpen ? " visible" : ""}`} onClick={handleCloseDrawer} />

      <aside className={`cart-drawer${isOpen ? " open" : ""}`} aria-label="Carrinho lateral">
        <div className="cart-header">
          <div>
            <strong>{checkoutOpen ? "Finalizar pedido" : "Seu carrinho"}</strong>
            <p>{totalItems} item{totalItems === 1 ? "" : "s"}</p>
          </div>
          <button type="button" className="cart-close" onClick={handleCloseDrawer}>
            Fechar
          </button>
        </div>

        {checkoutOpen ? (
          <>
            <div className="cart-body checkout-body">
              <section className="checkout-panel">
                <label className="checkout-field">
                  <span>Nome do cliente</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Digite o nome para identificar o pedido"
                  />
                </label>

                <label className="checkout-field">
                  <span>Telefone</span>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Ex.: (11) 99999-8888"
                  />
                </label>

                <label className="checkout-field">
                  <span>Forma de pagamento</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartao de debito">Cartao de debito</option>
                    <option value="Cartao de credito">Cartao de credito</option>
                  </select>
                </label>

                <label className="checkout-field">
                  <span>Observacoes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ex.: retirar amanha, separar mais gelado, sem troco"
                    rows={5}
                  />
                </label>

                <div className="checkout-summary">
                  <strong>Resumo do pedido</strong>
                  <div className="checkout-summary-list">
                    {detailedItems.map((item) => (
                      <div key={item.productId} className="checkout-summary-row">
                        <span>
                          {item.quantity}x {item.product.name}
                        </span>
                        <strong>{currency.format(item.subtotal)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{currency.format(totalPrice)}</strong>
              </div>

              <button
                type="button"
                className="buy-button cart-checkout"
                onClick={handleSendToWhatsApp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar para WhatsApp"}
              </button>

              <button type="button" className="clear-cart-link" onClick={() => setCheckoutOpen(false)}>
                Voltar ao carrinho
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cart-body">
              {detailedItems.length === 0 ? (
                <div className="cart-empty">
                  <strong>Seu carrinho esta vazio.</strong>
                  <p>Adicione produtos da vitrine ou da pagina de detalhes.</p>
                </div>
              ) : (
                detailedItems.map((item) => (
                  <article key={item.productId} className="cart-item">
                    <img src={item.product.imageUrl} alt={item.product.imageAlt} />

                    <div className="cart-item-content">
                      <Link href={`/produtos/${item.product.id}`} onClick={handleCloseDrawer}>
                        {item.product.name}
                      </Link>
                      <span>
                        {currency.format(item.product.price)} cada • Estoque: {item.product.availableQuantity}
                      </span>

                      <div className="cart-item-actions">
                        <button type="button" onClick={() => decreaseItem(item.productId)}>
                          -
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => increaseItem(item.productId)}
                          disabled={item.quantity >= item.product.availableQuantity}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="remove-link"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    <strong className="cart-item-total">{currency.format(item.subtotal)}</strong>
                  </article>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{currency.format(totalPrice)}</strong>
              </div>

              <button
                type="button"
                className="buy-button cart-checkout"
                disabled={detailedItems.length === 0}
                onClick={handleStartCheckout}
              >
                Finalizar pedido
              </button>

              {detailedItems.length > 0 ? (
                <button type="button" className="clear-cart-link" onClick={clearCart}>
                  Esvaziar carrinho
                </button>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
