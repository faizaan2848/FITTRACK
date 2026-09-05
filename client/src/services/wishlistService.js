import api from "./api";

export async function getWishlistRequest() {
  const { data } = await api.get("/wishlist");
  return data.wishlist;
}

export async function toggleWishlistRequest(productId) {
  const { data } = await api.post(`/wishlist/${productId}/toggle`);
  return data;
}
