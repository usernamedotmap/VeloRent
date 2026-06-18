import { Reservation } from "../models";

const HOUR_MS = 60 * 60 * 1000;

export const getAdminAnalytics = async (rangeDays: number = 30) => {
  const now = new Date();
  const fromDate = new Date(now.getTime() - rangeDays * 24 * HOUR_MS);

  const [
    dailyTrend,
    slotDistribution,
    channelBreakdown,
    topBikes,
    peakHours,
    rideStatusSummary,
  ] = await Promise.all([
    getDailyTrend(fromDate),
    getSlotDistribution(fromDate),
    getChannelBreakdown(fromDate),
    getTopBikes(fromDate),
    getPeakHours(fromDate),
    getRideStatusSummary(fromDate),
  ]);

  return {
    dailyTrend,
    slotDistribution,
    channelBreakdown,
    topBikes,
    peakHours,
    rideStatusSummary,
  };
};

// dail trand here
const getDailyTrend = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        status: { $nin: ["cancelled", "pending"] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { 
            format: "%Y-%m-%d", 
            date: "$createdAt",
            timezone: "Asia/Manila" // 🔥 FIX: Shifts UTC to Manila time before converting to a string
          },
        },
        revenue: { $sum: "$totalCost" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return result.map((r) => ({
    date: r._id,
    revenue: r.revenue,
    bookings: r.bookings,
  }));
};

const getSlotDistribution = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: "$slotHours",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const total = result.reduce((sum, r) => sum + r.count, 0) || 1;

  return result.map((r) => ({
    slotHours: r._id,
    count: r.count,
    percentage: (r.count / total) * 100,
  }));
};

const getChannelBreakdown = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        status: { $nin: ["cancelled", "pending"] },
      },
    },
    {
      $group: {
        _id: {
          week: {
            $week: {
              date: "$createdAt",
              timezone: "Asia/Manila",
            },
          },
          channel: "$channel",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.week": 1,
      },
    },
  ]);

  const weekMap = new Map<
    number,
    { week: number; online: number; walkIn: number }
  >();

  for (const r of result) {
    const week = r._id.week;
    if (!weekMap.has(week)) {
      weekMap.set(week, { week, online: 0, walkIn: 0 });
    }
    const entry = weekMap.get(week)!;
    if (r._id.channel === "online") { entry.online = r.count } else {

      entry.walkIn = r.count;
    };
  }

  return Array.from(weekMap.values());
};

const getTopBikes = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        // FIX: Only count reservations where the bike was actually ridden
        status: { $in: ["active", "completed", "overdue"] },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.bikeId",
        trips: { $sum: 1 },
      },
    },
    { $sort: { trips: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "bikes",
        localField: "_id",
        foreignField: "_id",
        as: "bike",
      },
    },
    { $unwind: { path: "$bike", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        bikeId: "$_id",
        name: "$bike.name",
        serialNumber: "$bike.serialNumber",
        category: "$bike.category",
        style: "$bike.style",
        trips: 1,
      },
    },
  ]);

  return result;
};

const getPeakHours = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: {
          $hour: {
            date: "$scheduledStart",
            timezone: "Asia/Manila",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // fill in 24 hours, even if it is 0
  const hourMap = new Map(result.map((r) => [r._id, r.count]));
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourMap.get(hour) ?? 0,
  }));
};

const getRideStatusSummary = async (fromDate: Date) => {
  const result = await Reservation.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    active: 0,
    overdue: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const r of result) {
    statusMap[r._id] = r.count;
  }

  return statusMap;
};
