// All auth-related HTTP calls live here. Components/context call these
// functions instead of importing `api` directly, so the request shape
// only needs to change in one place. `api` already sends credentials
// (the refresh-token cookie) on every request - see services/api.js.

import api from "./api";

export async function registerRequest({ name, email, password }) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function refreshRequest() {
  const { data } = await api.post("/auth/refresh");
  return data;
}

export async function logoutRequest() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function getMeRequest() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function updateProfileRequest(updates) {
  const { data } = await api.patch("/auth/me", updates);
  return data.user;
}
