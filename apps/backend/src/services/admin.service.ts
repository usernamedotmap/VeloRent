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
    pendingPayments,
    totalUsers,
    todayReservations,
    // This single aggregation replaces both separate revenue queries
    revenueMetrics,
  ] = await Promise.all([
    Bike.countDocuments({ isActive: true }),
    Bike.countDocuments({ status: "available", isActive: true }),
    Bike.countDocuments({ status: "in_use" }),
    Bike.countDocuments({ status: "maintenance" }),
    Reservation.countDocuments({ status: { $in: ["active", "overdue"] } }),
    Payment.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "customer" }),
    Reservation.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    }),

    // ANALYTICS STYLE: Single pass pipeline for all revenue tracking
    Reservation.aggregate([
      { 
        $match: { 
          status: { $nin: ["cancelled", "pending"] } 
        } 
      },
      {
        $group: {
          _id: null,
          // Sum up everything for total revenue
          totalRevenue: { $sum: "$totalCost" },
          // Conditionally sum up only if it falls within today's window
          todayRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", today] },
                    { $lt: ["$createdAt", tomorrow] }
                  ]
                },
                "$totalCost",
                0
              ]
            }
          }
        }
      }
    ]),
  ]);

  return {
    totalBikes,
    availableBikes,
    inUseBikes,
    maintenanceBikes,
    activeRides,
    pendingPayments,
    totalUsers,
    todayReservations,
    // Extract values safely from the single aggregate array payload
    todayRevenue: revenueMetrics[0]?.todayRevenue ?? 0,
    totalRevenue: revenueMetrics[0]?.totalRevenue ?? 0,
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
