import api from "./api";

export async function getAnalyticsRequest(range = "week") {
  const { data } = await api.get("/analytics", { params: { range } });
  return data;
}
