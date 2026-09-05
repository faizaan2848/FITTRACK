import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSalesRequest, confirmPaymentReceivedRequest } from "../../services/orderService";
import { useToast } from "../../context/ToastContext";
import { formatINR } from "../../utils/currency";
import styles from "./marketplace.module.css";

const STATUS_LABELS = {
  AWAITING_PAYMENT: "Waiting for buyer to pay",
  PAYMENT_SENT: "Buyer says they've paid",
  CONFIRMED: "Confirmed",
};

function Sales() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  async function loadSales() {
    setOrders(await getSalesRequest());
  }

  useEffect(() => {
    loadSales();
  }, []);

  async function handleConfirm(orderItemId) {
    setConfirmingId(orderItemId);
    try {
      await confirmPaymentReceivedRequest(orderItemId);
      showToast("Payment confirmed!", "success");
      await loadSales();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to confirm", "error");
    } finally {
      setConfirmingId(null);
    }
  }

  if (!orders) {
    return <div className={styles.page}>Loading...</div>;
  }

  const allItems = orders.flatMap((order) => order.items.map((item) => ({ ...item, orderId: order.id })));

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle} style={{ marginBottom: 6 }}>My Sales</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-4)" }}>
        Items other users have bought from your listings. Confirm once you've actually received payment.
      </p>

      {allItems.length === 0 ? (
        <div className={styles.emptyState}>
          No sales yet. <Link to="/marketplace/new">List something</Link> to start selling.
        </div>
      ) : (
        allItems.map((item) => (
          <div key={item.id} className={styles.cartItem} style={{ alignItems: "flex-start" }}>
            <div className={styles.cartItemInfo}>
              <div className={styles.cartItemName}>{item.product.name} × {item.quantity}</div>
              <div className={styles.cartItemPrice}>{formatINR(item.priceAtPurchase * item.quantity)}</div>
              <div style={{ fontSize: "0.8125rem", marginTop: 6, color: item.paymentStatus === "CONFIRMED" ? "#4ade80" : "var(--color-text-muted)" }}>
                {STATUS_LABELS[item.paymentStatus]}
              </div>
            </div>
            {item.paymentStatus === "PAYMENT_SENT" && (
              <button
                className={styles.addBtn}
                onClick={() => handleConfirm(item.id)}
                disabled={confirmingId === item.id}
              >
                {confirmingId === item.id ? "Confirming..." : "Confirm payment received"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Sales;
