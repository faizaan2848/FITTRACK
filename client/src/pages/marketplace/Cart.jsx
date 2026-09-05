import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCartRequest, updateCartItemRequest, removeCartItemRequest } from "../../services/cartService";
import { checkoutRequest, markPaymentSentRequest } from "../../services/orderService";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { formatINR } from "../../utils/currency";
import styles from "./marketplace.module.css";

const STATUS_LABELS = {
  AWAITING_PAYMENT: "Awaiting your payment",
  PAYMENT_SENT: "Waiting for seller to confirm",
  CONFIRMED: "Confirmed",
};

function OrderItemRow({ item, onMarkPaid }) {
  const [isMarking, setIsMarking] = useState(false);

  // QR resolution: prefer the QR uploaded on this listing, fall back to the
  // seller's profile QR. They are stored in two places (Product vs User),
  // so checkout must check both before saying "no QR".
  const listingQr = item.product?.sellerQrImageUrl;
  const profileQr = item.seller?.paymentQrUrl;
  const qrUrl = listingQr || profileQr;
  const upiId = item.product?.sellerUpiId;

  async function handleMarkPaid() {
    setIsMarking(true);
    try {
      await onMarkPaid(item.id);
    } finally {
      setIsMarking(false);
    }
  }

  return (
    <div className={styles.cartItem} style={{ alignItems: "flex-start" }}>
      <div className={styles.cartItemInfo}>
        <div className={styles.cartItemName}>{item.product.name} × {item.quantity}</div>
        <div className={styles.cartItemPrice}>{formatINR(item.priceAtPurchase * item.quantity)}</div>
        <div style={{ fontSize: "0.8125rem", marginTop: 6, color: item.paymentStatus === "CONFIRMED" ? "#4ade80" : "var(--color-text-muted)" }}>
          {STATUS_LABELS[item.paymentStatus]}
        </div>

        {item.paymentStatus === "AWAITING_PAYMENT" && qrUrl && (
          <div style={{ marginTop: 12, padding: 12, background: "var(--color-bg)", borderRadius: "var(--radius-md)", maxWidth: 220 }}>
            <div style={{ fontSize: "0.8125rem", marginBottom: 8, color: "var(--color-text-muted)" }}>
              Scan to pay <strong style={{ color: "var(--color-text)" }}>{item.seller.name}</strong> directly:
            </div>
            <img src={qrUrl} alt={`${item.seller.name}'s payment QR`} style={{ width: "100%", borderRadius: 8 }} />
            <button
              className={styles.addBtn}
              style={{ marginTop: 10, width: "100%", padding: "9px" }}
              onClick={handleMarkPaid}
              disabled={isMarking}
            >
              {isMarking ? "Marking..." : "I've sent the payment"}
            </button>
          </div>
        )}

        {item.paymentStatus === "AWAITING_PAYMENT" && !qrUrl && upiId && (
          <div style={{ marginTop: 12, padding: 12, background: "var(--color-bg)", borderRadius: "var(--radius-md)", maxWidth: 220 }}>
            <div style={{ fontSize: "0.8125rem", marginBottom: 8, color: "var(--color-text-muted)" }}>
              Pay <strong style={{ color: "var(--color-text)" }}>{item.seller.name}</strong> directly via UPI:
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9375rem", color: "var(--color-text)", marginBottom: 10 }}>{upiId}</div>
            <button
              className={styles.addBtn}
              style={{ marginTop: 0, width: "100%", padding: "9px" }}
              onClick={handleMarkPaid}
              disabled={isMarking}
            >
              {isMarking ? "Marking..." : "I've sent the payment"}
            </button>
          </div>
        )}

        {item.paymentStatus === "AWAITING_PAYMENT" && !qrUrl && !upiId && (
          <div style={{ fontSize: "0.8125rem", color: "#fbbf24", marginTop: 8 }}>
            This seller hasn't added a payment QR yet — contact them directly to arrange payment.
          </div>
        )}
      </div>
    </div>
  );
}

function Cart() {
  const { refreshCartCount } = useCart();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  async function loadCart() {
    const data = await getCartRequest();
    setCart(data);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleQuantityChange(itemId, newQty) {
    if (newQty <= 0) {
      await removeCartItemRequest(itemId);
    } else {
      await updateCartItemRequest(itemId, newQty);
    }
    await loadCart();
    refreshCartCount();
  }

  async function handleRemove(itemId) {
    await removeCartItemRequest(itemId);
    await loadCart();
    refreshCartCount();
  }

  async function handleCheckout() {
    setError(null);
    setIsCheckingOut(true);
    try {
      const newOrder = await checkoutRequest();
      setOrder(newOrder);
      refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function handleMarkPaid(orderItemId) {
    try {
      const updatedOrder = await markPaymentSentRequest(orderItemId);
      setOrder(updatedOrder);
      showToast("Marked as paid — waiting for the seller to confirm.", "success");
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to update", "error");
    }
  }

  if (order) {
    const allConfirmed = order.status === "CONFIRMED";
    return (
      <div className={styles.page}>
        <div className={styles.successBanner}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>
            {allConfirmed ? "Order complete! 🎉" : "Order placed — payment needed"}
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>
            Order total: <strong style={{ color: "var(--color-text)" }}>{formatINR(order.total)}</strong>
          </div>
        </div>

        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} onMarkPaid={handleMarkPaid} />
        ))}

        <Link to="/marketplace" className={styles.addBtn} style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: "var(--space-4)" }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!cart) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle} style={{ marginBottom: "var(--space-4)" }}>Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className={styles.emptyState}>
          Your cart is empty. <Link to="/marketplace">Browse the marketplace</Link>.
        </div>
      ) : (
        <>
          {cart.items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.cartItemInfo}>
                <div className={styles.cartItemName}>{item.product.name}</div>
                <div className={styles.cartItemPrice}>{formatINR(item.product.price)} each</div>
              </div>
              <div className={styles.qtyRow}>
                <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>−</button>
                <div className={styles.qtyValue}>{item.quantity}</div>
                <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className={styles.price}>{formatINR(item.product.price * item.quantity)}</div>
              <button className={styles.wishlistBtn} onClick={() => handleRemove(item.id)}>✕</button>
            </div>
          ))}

          <div className={styles.cartSummary}>
            <div className={styles.cartTotal}>
              <span>Total</span>
              <span>{formatINR(cart.total)}</span>
            </div>
            {error && <div style={{ color: "#f87171", marginBottom: 12, fontSize: "0.875rem" }}>{error}</div>}
            <button className={styles.checkoutBtn} onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? "Placing order..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
