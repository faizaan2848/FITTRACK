import api from "./api";

export async function getProductsRequest({ category, search, sortBy } = {}) {
  const params = {};
  if (category) params.category = category;
  if (search) params.search = search;
  if (sortBy) params.sortBy = sortBy;
  const { data } = await api.get("/products", { params });
  return data.products;
}

export async function getProductRequest(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
}

export async function createProductRequest(payload) {
  const { data } = await api.post("/products", payload);
  return data.product;
}
