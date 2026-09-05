import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(req.user.sub),
    getUnreadCount(req.user.sub),
  ]);
  res.status(200).json({ notifications, unreadCount });
});

export const patchRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.user.sub, req.params.id);
  res.status(200).json({ notification });
});

export const patchReadAll = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.sub);
  res.status(200).json({ message: "All notifications marked as read" });
});
