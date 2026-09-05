import api from "./api";

export async function getCartRequest() {
  const { data } = await api.get("/cart");
  return data;
}

export async function addToCartRequest(productId, quantity = 1) {
  const { data } = await api.post("/cart", { productId, quantity });
  return data.item;
}

export async function updateCartItemRequest(cartItemId, quantity) {
  const { data } = await api.put(`/cart/${cartItemId}`, { quantity });
  return data.item;
}

export async function removeCartItemRequest(cartItemId) {
  await api.delete(`/cart/${cartItemId}`);
}
