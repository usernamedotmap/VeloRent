import { DBNotification } from "@/types/notification.types";
import { create } from "zustand";

interface NotificationState {
  notifications: DBNotification[];
  unreadCount: number;
  isLoading: boolean;

  setNotifications: (
    notification: DBNotification[],
    unreadCount: number,
  ) => void;
  prependNotification: (notification: DBNotification) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  prependNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markOneRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
}));
