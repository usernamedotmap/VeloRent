export type DashboardNotificationEvent =
  | "new_reservation"
  | "payment_confirmed"
  | "ride_warning"
  | "ride_overdue"
  | "ride_started"
  | "ride_completed"
  | "reservation_cancelled";

export interface DBNotification {
  _id: string;
  recipientRole: "admin" | "operator";
  event: DashboardNotificationEvent;
  title: string;
  message: string;
  reservationId?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SocketNotification {
  id: string;
  event: DashboardNotificationEvent;
  title: string;
  message: string;
  reservationId?: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export const NOTIFICATION_CONFIG: Record<
  DashboardNotificationEvent,
  {
    icon: string;
    color: string;
    bg: string;
  }
> = {
  new_reservation: { icon: "🚲", color: "text-green-600", bg: "bg-green-50" },
  payment_confirmed: { icon: "✅", color: "text-blue-600", bg: "bg-blue-50" },
  ride_warning: { icon: "⏰", color: "text-amber-600", bg: "bg-amber-50" },
  ride_overdue: { icon: "⚠️", color: "text-red-600", bg: "bg-red-50" },
  ride_started: { icon: "🚴", color: "text-green-600", bg: "bg-green-50" },
  ride_completed: { icon: "🏁", color: "text-blue-600", bg: "bg-blue-50" },
  reservation_cancelled: { icon: "❌", color: "text-red-600", bg: "bg-red-50" },
};
