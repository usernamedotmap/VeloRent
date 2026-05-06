import mongoose from "mongoose";
import {
  CreateNotificationInput,
  EmitNotificationInput,
  emitToRole,
  SocketEvent,
} from "../config/socket";
import {
  DashboardNotificationEvent,
  NotificationEventModel,
  NotificationRecipientRole,
} from "../models/NotificationEvents.model";

export const dashboardToSocketEvent = (e: DashboardNotificationEvent): SocketEvent => {
  switch (e) {
    case "new_reservation":
      return "notification:new-reservation";
    case "ride_overdue":
      return "notification:overdue";
    case "payment_confirmed":
      return "notification:payment-confirmed";
    default:
      return "notification:new-reservation";
  }
};

// create + emit notification dito man
export const createDashboardNotifcation = async (
  input: CreateNotificationInput,
  session?: mongoose.ClientSession,
): Promise<EmitNotificationInput[]> => {
  const roles: NotificationRecipientRole[] =
    input.recipientRole === "both"
      ? ["admin", "operator"]
      : [input.recipientRole];

  const emits: EmitNotificationInput[] = [];

  // save one DB record per role okie?
  for (const role of roles) {
    const saved = await NotificationEventModel.create(
      [
        {
          recipientRole: role,
          event: input.event,
          title: input.title,
          message: input.message,
          reservationId: input.reservationId,
          metadata: input.metadata,
          isRead: false,
        },
      ],
      session ? { session } : undefined,
    );

    emits.push({
      title: saved[0].title,
      message: saved[0].message,
      reservationId: String(saved[0].reservationId ?? input.reservationId ?? ""),
      metadata: saved[0].metadata ?? input.metadata,
      isRead: saved[0].isRead,
      timestamp: saved[0].createdAt?.toISOString(),
    });
  }
  return emits;
};

// fetch for belling ton ha
export const getDashboardNotification = async (
  role: NotificationRecipientRole,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    NotificationEventModel.find({ recipientRole: role })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NotificationEventModel.countDocuments({ recipientRole: role }),
    NotificationEventModel.countDocuments({
      recipientRole: role,
      isRead: false,
    }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
    },
  };
};

// mark one read
export const markDashboardNotificationRead = async (
  id: string,
  role: NotificationRecipientRole,
): Promise<void> => {
  await NotificationEventModel.findOneAndUpdate(
    { _id: id, recipientRole: role },
    { isRead: true, readAt: new Date() },
  );
};

// mark all read
export const markAllDashboardNotificationsRead = async (
  role: NotificationRecipientRole,
): Promise<void> => {
  await NotificationEventModel.updateMany(
    { recipientRole: role, isRead: false },
    { isRead: true, readAt: new Date() },
  );
};

// unread count only
export const getDashboardUnreadCount = async (
  role: NotificationRecipientRole,
): Promise<number> =>
  NotificationEventModel.countDocuments({ recipientRole: role, isRead: false });
