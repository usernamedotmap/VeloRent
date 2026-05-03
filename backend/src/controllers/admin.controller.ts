import { asyncHandler } from "../utils/asyncHandler";
import * as AdminService from "../services/admin.service";
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
