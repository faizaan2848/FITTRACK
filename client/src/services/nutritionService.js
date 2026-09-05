import api from "./api";

export async function getDayNutritionRequest(date) {
  const { data } = await api.get("/nutrition/day", { params: date ? { date } : {} });
  return data;
}

export async function addMealRequest(payload) {
  const { data } = await api.post("/nutrition/meals", payload);
  return data.meal;
}

export async function deleteMealRequest(id) {
  await api.delete(`/nutrition/meals/${id}`);
}

export async function addWaterRequest(amountMl) {
  const { data } = await api.post("/nutrition/water", { amountMl });
  return data.entry;
}
