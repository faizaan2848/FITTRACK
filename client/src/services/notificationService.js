import api from "./api";

export async function getNotificationsRequest() {
  const { data } = await api.get("/notifications");
  return data; // { notifications, unreadCount }
}

export async function markNotificationReadRequest(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsReadRequest() {
  await api.patch("/notifications/read-all");
}
