import { asyncHandler } from "../utils/asyncHandler";
import * as AdminService from "../services/admin.service";
import * as AnalyticsService from '../services/analytics.service';
import { HttpStatus } from "../utils/httpStatus";
import { Errors } from "../utils/appError";
import { User } from "../models";

export const getStatsController = asyncHandler(async (req, res) => {
  const stats = await AdminService.getAdminStats();
  res.status(HttpStatus.OK).json({
    success: true,
    data: stats,
  });
});

export const getUsersController = asyncHandler(async (req, res) => {
  const rawFilters = (req as any).parsed?.query ?? req.query;

  const { pagination, users } = await AdminService.getAdminUser(rawFilters);

  res.status(HttpStatus.OK).json({
    success: true,
    data: users,
    meta: pagination,
  });
});

export const getPaymentsController = asyncHandler(async (req, res) => {
  const rawFilters = (req as any).parsed?.query ?? req.query;

  const { pagination, payments } =
    await AdminService.getAdminPayments(rawFilters);

  res.status(HttpStatus.OK).json({
    success: true,
    data: payments,
    meta: pagination,
  });
});

export const getAnalyticsController = asyncHandler(async (req, res) => {
  const rangeDays = Number(req.query.range) || 30;

  const analytics = await AnalyticsService.getAdminAnalytics(rangeDays);

  res.status(HttpStatus.OK).json({
    success: true,
    data: analytics,
  })
});

export const triggerRfidRegistrationController = asyncHandler(async (req, res) => {
  const { userId, deviceId, socketId } = req.body;

  console.log(`[RFID-CTRL] Register — userId:${userId} deviceId:${deviceId} socketId:${socketId}`);

  if (!userId || !deviceId || !socketId) {
    throw Errors.badRequest('userId, deviceId and socketId are required');
  }

  const user = await User.findById(userId);
  console.log(`[RFID-CTRL] User:`, user ? `${user.firstName} ${user.lastName}` : 'NOT FOUND');
  if (!user) throw Errors.notFound('User');

  const { getMqttClient } = await import('../config/mqtt');
  const { setPairing }    = await import('../config/rfidCache');
  const { emitToSocket }  = await import('../config/socket');
  const mqttClient        = getMqttClient();

  setPairing(deviceId, userId, socketId, (expiredDeviceId) => {
    console.log(`[RFID] Registration timed out for ${expiredDeviceId}`);
    emitToSocket(socketId, 'rfid:register-timeout', {
      deviceId: expiredDeviceId,
      message:  'No card was scanned within 30 seconds.',
    });
    mqttClient.publish(
      `velorent/device/${expiredDeviceId}/command`,
      JSON.stringify({ command: 'cancel_registration' }),
      { qos: 1 }
    );
  });

  // Tell Arduino to enter registration mode
  mqttClient.publish(
    `velorent/device/${deviceId}/command`,
    JSON.stringify({ command: 'enable_registration' }),
    { qos: 1 }
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data:    { message: 'Waiting for card scan — 30 second window', ttl: 30 },
  });
});
