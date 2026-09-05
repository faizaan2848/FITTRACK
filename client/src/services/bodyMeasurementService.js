import api from "./api";

export async function saveMeasurementRequest(payload) {
  const { data } = await api.post("/body-measurements", payload);
  return data.measurement;
}
