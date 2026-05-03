import { NotificationRecipientRole } from "../models";
import {
  getDashboardNotification,
  getDashboardUnreadCount,
  markAllDashboardNotificationsRead,
  markDashboardNotificationRead,
} from "../services/notifcationEvent.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatus } from "../utils/httpStatus";

export const getNotificationsController = asyncHandler(async (req, res) => {
  const role = req.user!.role as NotificationRecipientRole;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await getDashboardNotification(role, page, limit);

  res.status(HttpStatus.OK).json({
    success: true,
    data: result.notifications,
    meta: {
      ...result.pagination,
      unreadCount: result.unreadCount,
    },
  });
});

export const getUnreadCountController = asyncHandler(async (req, res) => {
  const role = req.user!.role as NotificationRecipientRole;
  const count = await getDashboardUnreadCount(role);

  res.status(HttpStatus.OK).json({
    success: true,
    data: { count },
  });
});

export const markOneReadController = asyncHandler(async (req, res) => {
  const role = req.user!.role as NotificationRecipientRole;
  await markDashboardNotificationRead(req.params.id, role);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "Notification marked as read",
    },
  });
});

export const markAllReadController = asyncHandler(async (req, res) => {
  const role = req.user!.role as NotificationRecipientRole;
  await markAllDashboardNotificationsRead(role);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "All notification marked as read",
    },
  });
});
