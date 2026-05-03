import { Bike, Payment, Reservation, User } from "../models";

export const getAdminStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalBikes,
    availableBikes,
    inUseBikes,
    maintenanceBikes,
    activeRides,
    todayPayments,
    totalRevenue,
    pendingPayments,
    totalUsers,
    todayReservations,
  ] = await Promise.all([
    Bike.countDocuments({ isActive: true }),
    Bike.countDocuments({ status: "available", isActive: true }),
    Bike.countDocuments({ status: "in_use" }),
    Bike.countDocuments({ status: "maintenance" }),
    Reservation.countDocuments({ status: { $in: ["active", "overdue"] } }),
    Payment.aggregate([
      { $match: { status: "paid", paidAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "customer" }),
    Reservation.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    }),
  ]);

  return {
    totalBikes,
    availableBikes,
    inUseBikes,
    maintenanceBikes,
    activeRides,
    todayRevenue: todayPayments[0]?.total ?? 0,
    totalRevenue: totalRevenue[0]?.total ?? 0,
    pendingPayments,
    totalUsers,
    todayReservations,
  };
};

export const getAdminUser = async (filters: any) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments(),
    User.find()
      .select("-passwordHash -refreshToken")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

export const getAdminPayments = async (filters: any) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [total, payments] = await Promise.all([
    Payment.countDocuments(),
    Payment.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};
