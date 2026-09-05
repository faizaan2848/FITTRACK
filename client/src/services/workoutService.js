import api from "./api";

export async function getWorkoutsRequest() {
  const { data } = await api.get("/workouts");
  return data.workouts;
}

export async function getWorkoutRequest(id) {
  const { data } = await api.get(`/workouts/${id}`);
  return data.workout;
}

export async function createWorkoutRequest(payload) {
  const { data } = await api.post("/workouts", payload);
  return data.workout;
}

export async function deleteWorkoutRequest(id) {
  await api.delete(`/workouts/${id}`);
}

export async function logWorkoutRequest(workoutId, payload) {
  const { data } = await api.post(`/workouts/${workoutId}/logs`, payload);
  return data.log;
}

export async function getWorkoutHistoryRequest() {
  const { data } = await api.get("/workouts/history");
  return data.logs;
}
