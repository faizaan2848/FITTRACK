import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

// Other services call this to fire a notification as a side effect of
// something real happening (order confirmed, workout logged, goal hit).
// Wrapped in try/catch by design: a failed notification should never
// break the actual action that triggered it (e.g. checkout must still
// succeed even if the notification insert fails for some reason).
export async function notifyUser(userId, type, message) {
  try {
    await prisma.notification.create({ data: { userId, type, message } });
  } catch {
    // Notifications are a nice-to-have side effect, not critical path.
  }
}

export async function listNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function createNotification(userId, { type, message }) {
  return prisma.notification.create({
    data: { userId, type, message },
  });
}

export async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new ApiError(404, "Notification not found");
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
