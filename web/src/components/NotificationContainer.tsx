"use client";

import React from "react";
import { useNotification, NotificationType } from "../services/notification";
import styles from "./NotificationContainer.module.css";

const notificationConfig: Record<
  NotificationType,
  { bgColor: string; icon: string }
> = {
  success: { bgColor: "#10b981", icon: "✓" },
  error: { bgColor: "#ef4444", icon: "✕" },
  warning: { bgColor: "#f59e0b", icon: "⚠" },
  info: { bgColor: "#3b82f6", icon: "ℹ" },
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className={styles.container}>
      {notifications.map((notif) => {
        const config = notificationConfig[notif.type];
        return (
          <div
            key={notif.id}
            className={styles.notification}
            style={{
              backgroundColor: config.bgColor,
            }}
            role="alert"
          >
            <span className={styles.icon}>{config.icon}</span>
            <span className={styles.message}>{notif.message}</span>
            <button
              className={styles.closeBtn}
              onClick={() => removeNotification(notif.id)}
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
