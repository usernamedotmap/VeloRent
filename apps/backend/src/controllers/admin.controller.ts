import { asyncHandler } from "../utils/asyncHandler";
import * as AdminService from "../services/admin.service";
import * as AnalyticsService from '../services/analytics.service';
import { HttpStatus } from "../utils/httpStatus";

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
})
