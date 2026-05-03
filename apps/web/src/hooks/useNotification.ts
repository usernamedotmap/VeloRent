import { api } from "@/lib/axios";
import { connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { DBNotification, SocketNotification } from "@/types/notification.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { join } from "path";
import { useEffect } from "react";

// fetch notificaion from DB on moutn
export const useNotificationList = () => {
  const user = useAuthStore((s) => s.user);
  const setNotification = useNotificationStore((s) => s.setNotifications);
  const setLoading = useNotificationStore((s) => s.setLoading);

  return useQuery({
    queryKey: ["notifications", user?.role],
    queryFn: async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{
          success: boolean;
          data: DBNotification[];
          meta: { unreadCount: number; total: number };
        }>("/notifications?limit=20");

        setNotification(data.data, data.meta.unreadCount);
        return data;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!user && user.role !== "customer",
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

// Mark one notificatinos as read
export const useMarkOneRead = () => {
  const markOneRead = useNotificationStore((s) => s.markOneRead);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onMutate: (id) => {
      // update ui immediately,
      markOneRead(id);
    },
    onError: (_, id) => {
      // rollback tayo kapag nag fiail api
      useNotificationStore.getState().markOneRead(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// mark-all notificatins are read
export const useMarkAllRead = () => {
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onMutate: () => {
      markAllRead();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// main hook
export const useNotifications = () => {
  const user = useAuthStore((s) => s.user);
  const prepentNotification = useNotificationStore(
    (s) => s.prependNotification,
  );
  const queryClient = useQueryClient();

  useNotificationList();

  useEffect(() => {
    if (!user || user.role === "customer") return;

    // small daely to ensuer natin the cookie is set
    const timer = setTimeout(() => {
      const socket = connectSocket();

      const handleNew = (socketNotif: SocketNotification) => {
        // conver sokc shape to DB shape
        const dbNotif: DBNotification = {
          _id: socketNotif.id,
          recipientRole: user.role as "admin" | "operator",
          event: socketNotif.event,
          title: socketNotif.title,
          message: socketNotif.message,
          reservationId: socketNotif.reservationId,
          isRead: false,
          metadata: socketNotif.metadata,
          createdAt: socketNotif.timestamp,
        };

        prepentNotification(dbNotif);

        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        // brwoser notification if tab hidden
        if (document.hidden && Notification.permission === "granted") {
          new Notification(socketNotif.title, {
            body: socketNotif.message,
            icon: "/favicon.cio",
          });
        }
      };

      socket.on("notification:new-reservation", handleNew);
      socket.on("notification:payment-confirmed", handleNew);
      socket.on("notification:overdue", handleNew);
      socket.on("notification:ride-warning", handleNew);

      return () => {
        socket.off("notification:new-reservation", handleNew);
        socket.off("notification:payment-confirmed", handleNew);
        socket.off("notification:overdue", handleNew);
        socket.off("notification:ride-warning", handleNew);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [user?.id, prepentNotification, queryClient]);

  // request browser notification
  useEffect(() => {
    if (user && user.role !== "customer") {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [user?.role]);
};
