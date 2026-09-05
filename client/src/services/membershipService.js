import api from "./api";

export async function getMembershipRequest() {
  const { data } = await api.get("/membership");
  return data;
}

export async function upgradePlanRequest(plan) {
  const { data } = await api.post("/membership/upgrade", { plan });
  return data.user;
}
