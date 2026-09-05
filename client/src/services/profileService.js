import api from "./api";

export async function updateProfileRequest(updates) {
  const { data } = await api.patch("/auth/me", updates);
  return data.user;
}
