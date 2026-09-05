import api from "./api";

export async function getExercisesRequest(category) {
  const { data } = await api.get("/exercises", { params: category ? { category } : {} });
  return data.exercises;
}

export async function toggleFavoriteRequest(exerciseId) {
  const { data } = await api.post(`/exercises/${exerciseId}/favorite`);
  return data;
}
