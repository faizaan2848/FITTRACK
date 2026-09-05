// Bell icon with an unread-count badge (same pattern as the cart badge)
// and a dropdown listing recent notifications. Polls every 30s so new
// notifications (like a seller confirming payment) show up without a
// full page reload.

import { useEffect, useRef, useState } from "react";
import {
  getNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import styles from "./NotificationBell.module.css";

const TYPE_ICONS = {
  WORKOUT_REMINDER: "🏋️",
  WATER_REMINDER: "💧",
  GOAL_ACHIEVED: "🎉",
  GENERAL: "🔔",
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  async function load() {
    try {
      const data = await getNotificationsRequest();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently ignore - the bell just won't update this cycle.
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    setIsOpen((prev) => !prev);
  }

  async function handleNotificationClick(notification) {
    if (!notification.isRead) {
      await markNotificationReadRequest(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadRequest();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={`${styles.bellBtn}${unreadCount > 0 ? ` ${styles.bellBtnUnread}` : ""}`}
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        title="Notifications"
        aria-expanded={isOpen}
      >
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>You're all caught up.</div>
          ) : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={n.isRead ? styles.item : `${styles.item} ${styles.itemUnread}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className={styles.itemIcon}>{TYPE_ICONS[n.type] || "🔔"}</span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemMessage}>{n.message}</span>
                    <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.isRead && <span className={styles.itemDot} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
