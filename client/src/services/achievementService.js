import api from "./api";

export async function getAchievementsRequest() {
  const { data } = await api.get("/achievements");
  return data.achievements;
}
