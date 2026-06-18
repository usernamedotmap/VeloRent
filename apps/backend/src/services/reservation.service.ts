import mongoose, { mongo } from "mongoose";
import { Errors } from "../utils/appError";
import { Bike, Reservation, TimerSession, User } from "../models";
import {
  CancelReservationInput,
  CreateReservationInput,
  ReservationFilterInput,
  WalkInReservationInput,
} from '@velorent/shared'
import { emitToRole } from "../config/socket";
import {
  createDashboardNotifcation,
  dashboardToSocketEvent,
} from "./notifcationEvent.service";
import { publishTimerCommand } from "../config/mqtt";
import {queueRideCompletedNotification} from '../services/notification.service'

const RATE_PER_HOUR = 15000;
const OVERDUE_RATE = 5000;
const OVERDUE_INTERVAL_SECS = 900;

// helper: extract nation ownerId
const extractOwnerId = (userId: unknown): string => {
  if (typeof userId === "object" && userId !== null) {
    return String((userId as any)._id);
  }
  return String(userId);
};

const validateObjectId = (id: string, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Errors.badRequest(`Invalid ${label} format`);
  }
};

// calculate the yung fixed price depends sa bike para sa reservation
const calculateBaseCost = (slotHours: number, bikeCount: number): number => {
  return slotHours * RATE_PER_HOUR * bikeCount;
};

// calculate when the the overdue cost
export const calculateOverdueCost = (overdueSeconds: number): number => {
  if (overdueSeconds <= 0) return 0;

  const intervalSeconds = Math.ceil(overdueSeconds / OVERDUE_INTERVAL_SECS);
  return intervalSeconds * OVERDUE_RATE;
};

// check for bikeids that are valid + availability
const validateBikeAvailable = async (
  bikeIds: string[],
): Promise<mongoose.Types.ObjectId[]> => {
  // can't choose/reserved the same bike twice
  const uniqueIds = [...new Set(bikeIds)];
  if (uniqueIds.length !== bikeIds.length) {
    throw Errors.badRequest(
      "Duplicate bikes in request. Each bike must be unique",
    );
  }

  const bikes = await Bike.find({
    _id: { $in: uniqueIds },
    status: "available",
    isActive: true,
  });

  if (bikes.length !== uniqueIds.length) {
    const foundIds = bikes.map((b) => String(b._id));
    const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));

    throw Errors.badRequest(
      `Some bikes are not available: ${missingIds.join(", ")}`,
    );
  }

  return uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
};

// make  the status of bike reserved - only success if bike is available
const lockBike = async (
  bikeId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
): Promise<boolean> => {
  const result = await Bike.findByIdAndUpdate(
    {
      _id: bikeId,
      status: "available",
      isActive: true,
    },
    {
      $set: { status: "reserved" },
    },
    {
      new: true,
      session,
    },
  );

  return result !== null;
};

// rollback - if some failed make the stauts bike available
const releaseBikes = async (
  bikeIds: mongoose.Types.ObjectId[],
): Promise<void> => {
  await Bike.updateMany(
    {
      _id: { $in: bikeIds },
      status: "reserved",
    },
    { $set: { status: "available" } },
  );
};

export const createOnlineReservation = async (
  userId: string,
  input: CreateReservationInput,
) => {
  validateObjectId(userId, "User ID");

  const { bikeIds, slotHours, scheduledStart, notes } = input;
  const validBikeIds = await validateBikeAvailable(bikeIds);
  const baseCost = calculateBaseCost(slotHours, validBikeIds.length);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // if any lock fails - any customer can got it first
    const lockedBikeIds: mongoose.Types.ObjectId[] = [];

    for (const bikeId of validBikeIds) {
      const locked = await lockBike(bikeId, session);

      if (!locked) {
        await releaseBikes(lockedBikeIds);
        throw Errors.badRequest(
          `Bike ${bikeId} is no longer available. Please select a different bike.`,
        );
      }

      lockedBikeIds.push(bikeId);
    }

    const [reservation] = await Reservation.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          channel: "online",
          status: "pending",
          slotHours,
          scheduledStart: new Date(scheduledStart),
          items: validBikeIds.map((bikeId) => ({
            bikeId,
            status: "waiting",
            overdueCost: 0,
          })),
          baseCost,
          totalCost: baseCost,
          notes,
        },
      ],
      { session },
    );

    const emits = await createDashboardNotifcation(
      {
        recipientRole: "both",
        event: "new_reservation",
        title: "🚲 New Online Reservation",
        message: `New booking for ${validBikeIds.length} bike${validBikeIds.length > 1 ? "s" : ""} — ${slotHours}hr slot`,
        reservationId: String(reservation._id),
        metadata: { bikeCount: validBikeIds.length },
      },
      session,
    );

    await session.commitTransaction();

    const socketEvent = dashboardToSocketEvent("new_reservation");
    for (const payload of emits) {
      emitToRole("both", socketEvent, {
        ...payload,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    }

    return reservation;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const createWalkInReservation = async (
  operatorId: string,
  input: WalkInReservationInput,
) => {
  const { bikeIds, slotHours, userId, notes } = input;

  const validBikeIds = await validateBikeAvailable(bikeIds);
  const baseCost = calculateBaseCost(slotHours, validBikeIds.length);

  const lockedBikeIds: mongoose.Types.ObjectId[] = [];
  try {
    for (const bikeId of validBikeIds) {
      const locked = await lockBike(bikeId);

      if (!locked) {
        await releaseBikes(lockedBikeIds);
        throw Errors.badRequest(
          `Bike ${bikeId} is no longer available. Please select a different bike.`,
        );
      }

      lockedBikeIds.push(bikeId);
    }

    const customerId = userId
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId(operatorId);

    const reservation = await Reservation.create({
      userId: customerId,
      channel: "walk_in",
      status: "confirmed",
      slotHours,
      scheduledStart: new Date(),
      items: validBikeIds.map((bikeId) => ({
        bikeId,
        status: "waiting",
        overdueCost: 0,
      })),
      baseCost,
      totalCost: baseCost,
      notes,
    });

        const emits = await createDashboardNotifcation({
      recipientRole: "both",
      event: "new_reservation",
      title: "🚲 New Walk-In Reservation",
      message: `New booking for ${validBikeIds.length} bike${validBikeIds.length > 1 ? "s" : ""} — ${slotHours}hr slot`,
      reservationId: String(reservation._id),
      metadata: { bikeCount: validBikeIds.length },
    });

    const socketEvent = dashboardToSocketEvent("new_reservation");
    for (const payload of emits) {
      emitToRole("both", socketEvent, {
        ...payload,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    }

    return reservation;
  } catch (err) {
    if (lockedBikeIds.length > 0) {
      await releaseBikes(lockedBikeIds);
    }
    throw err;
  }
};

export const getAllReservations = async (filters: ReservationFilterInput) => {
  const { status, channel, userId, page, limit } = filters;

  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (channel) query.channel = channel;
  if (userId) query.userId = new mongoose.Types.ObjectId(userId);

  const skip = (page - 1) * limit;

  const [total, reservations] = await Promise.all([
    Reservation.countDocuments(query),
    Reservation.find(query)
      .populate("userId", "firstName lastName email phone")
      .populate("items.bikeId", "name cataegory style serialNumber")
      .populate("paymentId", "amount status provider")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    reservations,
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

// get reservation (customer)
export const getMyReservation = async (
  userId: string,
  filters: ReservationFilterInput,
) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const status = filters.status;

  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [total, reservations] = await Promise.all([
    Reservation.countDocuments(query),
    Reservation.find(query)
      .populate("items.bikeId", "name category style serialNumber imageUrls")
      .populate("paymentId", "amount status provider")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const seen = new Set<string>();
  const unique = reservations.filter((r) => {
    const id = String(r._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return {
    reservations: unique,
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

export const getReservationById = async (
  id: string,
  userId: string,
  role: string,
) => {
  validateObjectId(id, "Reservation ID");

  const reservation = await Reservation.findById(id)
    .populate("userId", "firstName lastName email phone")
    .populate("items.bikeId", "name category style serialNumber imageUrls")
    .populate("paymentId", "amount status provider");

  if (!reservation) throw Errors.notFound("Reservation");

  // customer  can only see their own resrevations
  if (role === "customer" && extractOwnerId(reservation.userId) !== userId) {
    throw Errors.forbidden("You do not have access to this reservation.");
  }

  if (role === "customer") {
    const reservationOwnerId =
      typeof reservation.userId === "object" && reservation.userId !== null
        ? String((reservation.userId as any)._id)
        : String(reservation.userId);

    if (reservationOwnerId !== userId) {
      throw Errors.forbidden("You do not have access to this reservation.");
    }
  }

  return reservation;
};

export const cancelReservation = async (
  id: string,
  userId: string,
  role: string,
  input: CancelReservationInput,
) => {
  validateObjectId(id, "Reservation ID");

  const reservation = await Reservation.findById(id);
  if (!reservation) throw Errors.notFound("Reservation");

  // ownershot check
  if (role === "customer") {
    const ownerId = extractOwnerId(reservation.userId);
    if (ownerId !== userId) {
      throw Errors.forbidden("You cannot cancel this reservation.");
    }
  }

  // Cutomer can only cancel their own
  const cancellabeStatuses =
    role === "customer" ? ["pending"] : ["pending", "confirmed"];

  if (!cancellabeStatuses.includes(reservation.status)) {
    throw Errors.badRequest(
      `Cannot cancel a reservation with status "${reservation.status}".` +
        (role === "customer" && reservation.status === "confirmed"
          ? " Your payment has already been confirmed. Please contact support for a refund."
          : ""),
    );
  }

  // free all waiting bikes
  const bikeIds = reservation.items
    .filter((i) => ["waiting", "active"].includes(i.status))
    .map((i) => i.bikeId);

  await Bike.updateMany(
    { _id: { $in: bikeIds } },
    { $set: { status: "available" } },
  );

  const needsRefund =
    reservation.channel === "online" &&
    reservation.paymentId &&
    reservation.status === "confirmed";

  reservation.status = "cancelled";
  reservation.cancellationReason = input.cancellationReason;
  await reservation.save();

  if (needsRefund) {
    const { processRefund } = await import("./payment.service");
    await processRefund(String(reservation.paymentId));
  }
  return { reservation, needsRefund: !!needsRefund };
};

export const startReservationItem = async (
  reservationId: string,
  itemId: string,
  operatorId: string,
) => {
  validateObjectId(reservationId, "Reservation ID");

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw Errors.notFound("Reservation");

  // check if  the status reservation is confirmed or already active then we can start dawg
  if (!["confirmed", "active"].includes(reservation.status)) {
    throw Errors.badRequest(
      `Cannot start a bike on a reservation with status ${reservation.status}`,
    );
  }

  // find specifi item
  const item = reservation.items.find((i) => String(i._id) === itemId);
  if (!item) throw Errors.notFound("Reservation item");

  if (item.status !== "waiting") {
    throw Errors.badRequest(
      `This bike is already "${item.status}". Only waiting bikes can be started.`,
    );
  }

  const locked = await Bike.findByIdAndUpdate(
    { _id: item.bikeId, status: "reserved" },
    { $set: { status: "in_use" } },
    { new: true },
  );

  if (!locked) throw Errors.badRequest("Bike is not in the expected state.");

  // create timer session
  const slotSeconds = reservation.slotHours * 3600;
  const timerSession = await TimerSession.create({
    reservationId: reservation._id,
    reservationItemId: item._id,
    userId: reservation.userId,
    bikeId: item.bikeId,
    slotSeconds,
    startedAt: new Date(),
    isActive: true,
    isOverdue: false,
    overdueSeconds: 0,
  });

  item.status = "active";
  item.actualStart = new Date();
  item.timerSessionId = timerSession._id as mongoose.Types.ObjectId;

  if (reservation.status === "confirmed") {
    reservation.status = "active";
  }

  await reservation.save();

  publishTimerCommand(reservationId, itemId, "start", {
    slotSeconds: reservation.slotHours * 3600,
    bikeId: String(item.bikeId),
  });

  return reservation;
};

export const completeReservationItem = async (
  reservationId: string,
  itemId: string,
  operatorId: string,
) => {
  validateObjectId(reservationId, "Reservation ID");

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw Errors.notFound("Reservation");

  const item = reservation.items.find((i) => String(i._id) === itemId);
  if (!item) throw Errors.notFound("Reservation item");

  if (!["active", "overdue"].includes(reservation.status)) {
    throw Errors.badRequest(
      `This bike is "${item.status}". Only active or overdue bikes can be completed.`,
    );
  }

  const now = new Date();
  item.status = "completed";
  item.actualEnd = now;

  // calculate overdue
  if (item.timerSessionId) {
    const timerSession = await TimerSession.findById(item.timerSessionId);

    if (timerSession?.isActive) {
      const elapsedSeconds = Math.floor(
        (now.getTime() - timerSession.startedAt.getTime()) / 1000,
      );

      timerSession.isActive = false;
      timerSession.endedAt = now;
      timerSession.elapsedSeconds = elapsedSeconds;

      if (elapsedSeconds > timerSession.slotSeconds) {
        timerSession.isOverdue = true;
        timerSession.overdueSeconds = elapsedSeconds - timerSession.slotSeconds;
        item.overdueCost = calculateOverdueCost(timerSession.overdueSeconds);
      }

      await timerSession.save().catch((err) => {
        console.error('[COMPLETE] TimerSession save  failed:', err);
      });
    }
  }


  // free the bike
  await Bike.findByIdAndUpdate(item.bikeId, {
    $set: { status: "available" },
    $inc: { totalTrips: 1 },
  });

  // check if all the items completeed
  const allCompleted = reservation.items.every((i) =>
    String(i._id) === itemId ? true : i.status === "completed",
  );

  if (allCompleted) {
    reservation.status = "completed";
    const totalOverdue = reservation.items.reduce(
      (sum, i) =>
        sum + (String(i._id) === itemId ? item.overdueCost : i.overdueCost),
      0,
    );

    reservation.totalCost = reservation.baseCost + totalOverdue;
   
// Queue completion notifications
    const user = await User.findById(reservation.userId);
    if (user && reservation.channel === "online") { // <--- Add channel condition here
      
      await queueRideCompletedNotification(reservation, user as any);
    }
  }

  await reservation.save();

  publishTimerCommand(reservationId, itemId, "complete", {
    totalCost: reservation.totalCost,
    overdueCost: Math.max(0, reservation.totalCost - reservation.baseCost),
  });
  
  return reservation;
};
