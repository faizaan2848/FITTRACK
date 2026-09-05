import api from "./api";

export async function getDashboardSummaryRequest() {
  const { data } = await api.get("/dashboard/summary");
  return data;
}
