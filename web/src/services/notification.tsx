"use client";

import React from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
    duration?: number,
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = (
    type: NotificationType,
    message: string,
    duration = 5000,
  ) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, type, message, duration };
    setNotifications((prev) => [...prev, notification]);

    if (duration) {
      setTimeout(() => removeNotification(id), duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification deve ser usado dentro de NotificationProvider",
    );
  }
  return context;
}

export function useNotificationHelpers() {
  const { addNotification } = useNotification();
  return {
    success: (message: string, duration?: number) =>
      addNotification("success", message, duration),
    error: (message: string, duration?: number) =>
      addNotification("error", message, duration),
    warning: (message: string, duration?: number) =>
      addNotification("warning", message, duration),
    info: (message: string, duration?: number) =>
      addNotification("info", message, duration),
  };
}
