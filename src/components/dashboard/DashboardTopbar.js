import React, { useEffect, useState } from "react";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useAuth } from "../../context/AuthContext";
import messagingService from "../../services/messagingService";

import "./DashboardTopbar.css";

function DashboardTopbar({ title, subtitle }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const items = await messagingService.notifications();
        if (active) setNotifications(items);
      } catch {
        if (active) setNotifications([]);
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const unread = notifications.filter((item) => !item.is_read).length;
  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await messagingService.markRead(notification.id);
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    } catch {
      // Keep the notification visible if the server is temporarily unavailable.
    }
  };

  return (
    <header className="dashboard-topbar">
      {/* PAGE TITLE */}

      <div className="dashboard-topbar-title">
        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>

      {/* RIGHT SIDE */}

      <div className="dashboard-topbar-actions">
        <button
          className="notification-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <NotificationsNoneIcon />

          {unread > 0 && (
            <span className="notification-dot">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {open && (
          <div
            className="dashboard-notifications"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="dashboard-notifications-header">
              <strong>Notifications</strong>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                &times;
              </button>
            </div>
            {notifications.length ? (
              notifications.slice(0, 8).map((notification) => (
                <button
                  type="button"
                  className={`dashboard-notification ${notification.is_read ? "" : "unread"}`}
                  key={notification.id}
                  onClick={() => markRead(notification)}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.body}</span>
                </button>
              ))
            ) : (
              <p className="dashboard-notifications-empty">
                You are all caught up.
              </p>
            )}
          </div>
        )}

        <div className="topbar-profile">
          <div className="topbar-avatar">
            {(user?.first_name || "U").charAt(0).toUpperCase()}
          </div>

          <div className="topbar-profile-info">
            <strong>{user?.first_name || "Guest"}</strong>

            <span>{user?.email}</span>
          </div>

          <KeyboardArrowDownIcon />
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
