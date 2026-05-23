import { Bike, Notification, Reservation, TimerSession } from "../models";
import cron from "node-cron";
import {
  processPendingNotifications,
  retryFailedNotifications,
} from "./notificationSender";
import { emitToRole } from "../config/socket";
import {
  createDashboardNotifcation,
  dashboardToSocketEvent,
} from "./notifcationEvent.service";

const WARNING_THRESHOLD_SECS = 900;
const OVERDUE_RATE_CENTAVOS = 5000;
const OVERDUE_INTERVAL_SECS = 900;

const calculateOverdueCost = (overdueSeconds: number): number => {
  if (overdueSeconds <= 0) return 0;
  const intervals = Math.ceil(overdueSeconds / OVERDUE_INTERVAL_SECS);
  return intervals * OVERDUE_RATE_CENTAVOS;
};

const formatOverdueMessage = (
  firstName: string,
  overdueMinutes: number,
  overdueCost: number,
): string => {
  const cost = (overdueCost / 100).toFixed(2);
  return (
    `Hi ${firstName}! Your VeloRent bike is ${overdueMinutes} minute(s) overdue. ` +
    `Overdue charge: ₱${cost}. Please return the bike immediately. ` +
    `Additional ₱50 charged every 15 minutes.`
  );
};

const formatWarningMessage = (
  firstName: string,
  remainingMinutes: number,
): string =>
  `Hi ${firstName}! Reminder: Your VeloRent bike slot ends in ` +
  `${remainingMinutes} minute(s). Please start heading back. Thank you!`;

// cron job 1: warning check
// Find session ending withing 15 minutes adn quque warning notif
export const runWarningCheck = async (): Promise<void> => {
  const now = new Date();

  try {
    // find sesesion that stil active:
    // 1. haven't sent warning yet
    // 2. wil end withint 15 mintes
    const sessions = await TimerSession.find({
      isActive: true,
      isOvedue: false,
      warningSentAt: { $exists: false },
    }).populate("userId", "firstName phone email");

    let warningCount = 0;

    for (const session of sessions) {
      const elapseSecs = Math.floor(
        (now.getTime() - session.startedAt.getTime()) / 1000,
      );
      const remainingSecs = session.slotSeconds - elapseSecs;

      // withint warning but not yet overdue
      if (remainingSecs > 0 && remainingSecs <= WARNING_THRESHOLD_SECS) {
        const user = session.userId as any;
        const remainingMins = Math.ceil(remainingSecs / 60);
        const message = formatWarningMessage(user.firstName, remainingMins);

        await Notification.create({
          userId: session.userId,
          reservationId: session.reservationId,
          channel: "sms",
          event: "ride_warning",
          recipient: user.phone,
          message,
          status: "pending",
        });

        session.warningSentAt = now;
        emitToRole("both", "notification:ride-warning", {
          title: "⏰ Ride Ending Soon",
          message: `A bike slot ends in ${remainingMins} minutes${remainingMins !== 1 ? "s" : ""}`,
          reservationId: String(session.reservationId),
        });
        await session.save();

        warningCount++;
      }
    }

    if (warningCount > 0) {
      console.log(`[CRON] Warning check — queued ${warningCount} warning SMS`);
    }
  } catch (err) {
    console.error("[CRON] Warning check failed:", err);
  }
};

// job 2: overdue check
// find session that have exceeded their slot time
export const runOverdueCheck = async (): Promise<void> => {
  {
    const now = new Date();

    try {
      // find all active sessions  where slot time has passed na
      const overdueSessions = await TimerSession.find({
        isActive: true,
        isOverdue: false, // not yet mearked as overdue - first detection kasi nga di pa overdue ngaing
        $expr: {
          $lt: [
            {
              $add: ["$startedAt", { $multiply: ["$slotSeconds", 1000] }],
            },
            now,
          ],
        },
      }).populate("userId", "firstName phone email");

      if (overdueSessions.length === 0) return;

      console.log(
        `[CRON] Overdue check — found ${overdueSessions.length} overdue session(s)`,
      );

      for (const session of overdueSessions) {
        try {
          const user = session.userId as any;
          const elapseSeconds = Math.floor(
            (now.getTime() - session.startedAt.getTime()) / 1000,
          );
          const overdueSecs = elapseSeconds - session.slotSeconds;
          const overdueMins = Math.ceil(overdueSecs / 60);
          const overdueCost = calculateOverdueCost(overdueSecs);

          // update timer seeesionn
          session.isOverdue = true;
          session.overdueSeconds = overdueSecs;
          session.elapsedSeconds = elapseSeconds;
          await session.save();

          // -- update natin reservation item
          const reservation = await Reservation.findById(session.reservationId);
          if (!reservation) continue;

          const item = reservation.items.find(
            (i) => String(i._id) === String(session.reservationItemId),
          );

          if (item) {
            item.status = "overdue";
            item.overdueCost = overdueCost;
          }

          if (reservation.status === "active") {
            reservation.status = "overdue";
          }
          await reservation.save();

          // -- free bike back to available
          // per business rule - bike is released when overdue
          await Bike.findByIdAndUpdate(session.bikeId, {
            $set: { status: "available" },
          });

          const emits = await createDashboardNotifcation({
            recipientRole: "operator",
            event: "ride_overdue",
            title: "⚠️ Bike Overdue",
            message: `${overdueMins} min overdue - ${user.firstName} (${user.phone})`,
            reservationId: String(reservation._id),
            metadata: { overdueMins, overdueCost },
          });

          // queye SMS to cutomer --- hehe
          const overdueMessage = formatOverdueMessage(
            user.firstName,
            overdueMins,
            overdueCost,
          );

          await Notification.create({
            userId: session.userId,
            reservationId: session.reservationId,
            channel: "sms",
            event: "ride_overdue",
            recipient: user.phone,
            message: overdueMessage,
            status: "pending",
          });

          // quqey operation notificaitaon ------
          // stored as a system notifcation - operator dashbaord
          // reads pending 'ride_overdue' notifcations
          await Notification.create({
            userId: session.userId,
            reservationId: session.reservationId,
            channel: "sms",
            event: "ride_overdue",
            recipient: "operator",
            message:
              `OVERDUE ALERT: Bike ${session.bikeId} is ${overdueMins} min overdue. ` +
              `Customer: ${user.firstName} (${user.phone}). ` +
              `Overdue charge so far: ₱${(overdueCost / 100).toFixed(2)}`,
            status: "pending",
          });

          const socketEvent = dashboardToSocketEvent("ride_overdue");
          for (const payload of emits) {
            emitToRole("operator", socketEvent, {
              ...payload,
              timestamp: payload.timestamp ?? new Date().toISOString(),
            });
          }

          console.log(
            `[CRON] Marked overdue — session ${session._id} | ` +
              `bike ${session.bikeId} | ${overdueMins} min | ₱${(overdueCost / 100).toFixed(2)}`,
          );
        } catch (sessionErr) {
          console.error(
            `[CRON] Failed to process session ${session._id}:`,
            sessionErr,
          );
        }
      }
    } catch (err) {
      console.error("[CRON] Overdue check failed:", err);
    }
  }
};

// job 3: elapsed secons upated --------
// keeps elapsedSeconds current in DB - useful for real-time timer ui
export const runElapsedUpdate = async (): Promise<void> => {
  const now = new Date();

  try {
    const activeSessions = await TimerSession.find({ isActive: true });

    const bulkOps = activeSessions.map((session) => {
      const elapsedSecs = Math.floor(
        (now.getTime() - session.startedAt.getTime()) / 1000,
      );

      return {
        updateOne: {
          filter: { _id: session._id },
          update: {
            $set: {
              elapseSeconds: elapsedSecs,
              lastSyncedAt: now,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await TimerSession.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error("[CRON] Elapsed update failed:", err);
  }
};

export const runPendingReservationExpiry = async (): Promise<void> => {
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

  const expired = await Reservation.find({
    status: "pending",
    channel: "online",
    createdAt: { $lt: fifteenMinsAgo },
  });

  if (expired.length === 0) return;

  console.log(`[CRON] Expiring ${expired.length} unpaid reservations`);

  for (const reservation of expired) {
    try {
      // releases bikes
      const bikeIds = reservation.items.map((i) => i.bikeId);
      await Bike.updateMany(
        { _id: { $in: bikeIds}, status: 'reserved'},
        { $set: { status: 'available' } },
      );

      reservation.status = 'cancelled';
      reservation.cancellationReason = 'Payment not completed withing 15 minutes';
      await reservation.save();

      console.log(`[CRON] Expired reservation ${reservation._id}`);
    } catch (err) {
      console.log(`[CRON] Failed to expire ${reservation._id}:`, err);
    }
  }
};

// -- register all the jobs here ---- okay ?
export const initCronJobs = (): void => {
  // Every 5 minutes - warin + overdue checks okay so gana per 5 mins
  cron.schedule("*/5 * * * *", async () => {
    console.log(`[CRON] Running checks at ${new Date().toISOString()}`);
    await runWarningCheck();
    await runOverdueCheck();
    await runPendingReservationExpiry();
  });

  //  Every minute - sync elapsd seconds
  cron.schedule("* * * * *", async () => {
    await runElapsedUpdate();
  });

  // Every minute - process pending notifcations
  cron.schedule("* * * * *", async () => {
    await processPendingNotifications();
  });

  // Every 30 minuts - retry failed notifications
  cron.schedule("*/30 * * * *", async () => {
    await retryFailedNotifications();
  });
};



