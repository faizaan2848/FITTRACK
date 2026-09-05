import api from "./api";

export async function checkoutRequest() {
  const { data } = await api.post("/orders/checkout");
  return data.order;
}

export async function getOrdersRequest() {
  const { data } = await api.get("/orders");
  return data.orders;
}

// Orders where I'm the seller on at least one item.
export async function getSalesRequest() {
  const { data } = await api.get("/orders/sales");
  return data.orders;
}

// Buyer: "I sent the payment via the seller's QR."
export async function markPaymentSentRequest(orderItemId) {
  const { data } = await api.post(`/orders/items/${orderItemId}/mark-paid`);
  return data.order;
}

// Seller: "I received the payment."
export async function confirmPaymentReceivedRequest(orderItemId) {
  const { data } = await api.post(`/orders/items/${orderItemId}/confirm-received`);
  return data.order;
}
