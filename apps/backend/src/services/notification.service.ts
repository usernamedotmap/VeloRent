import { IReservation, IUser, Notification } from "../models";
import { createDashboardNotifcation } from "./notifcationEvent.service";

export const queueBookingConfirmedNotification = async (
  reservation: IReservation,
  user: IUser,
): Promise<void> => {
  const date = new Date(reservation.scheduledStart).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const bikes = reservation.items.length;
  const cost = (reservation.totalCost / 100).toFixed(2);

  const smsMessage = `Ref: ${String(reservation._id).slice(-6).toUpperCase()} | Date: ${date}`;
  // `Hi ${user.firstName}! 3Jremy booking confirmed. ` +
  // `${bikes} bike${bikes > 1 ? "s" : ""} | ${reservation.slotHours}hr | ` +
  // `${date} | P${cost}. Show this at counter. Enjoy!`;

  const emailMessage =
    `Hi ${user.firstName}! 3Jremy booking confirmed. ` +
    `${bikes} bike${bikes > 1 ? "s" : ""} | ${reservation.slotHours}hr | ` +
    `${date} | P${cost}. Show this at counter. Enjoy!`;

  // Queue SMS
  await Notification.create({
    userId: user._id,
    reservationId: reservation._id,
    channel: "sms",
    event: "booking_confirmed",
    recipient: user.phone,
    message: smsMessage,
    status: "pending",
  });

  // QUeuw email
  await Notification.create({
    userId: user._id,
    reservationId: reservation._id,
    channel: "email",
    event: "booking_confirmed",
    recipient: user.email,
    message: emailMessage,
    status: "pending",
  });

  await createDashboardNotifcation({
    recipientRole: "both",
    event: "payment_confirmed",
    title: "✅ Payment Confirmed",
    message: `Reservation ${String(reservation._id)?.slice(-6).toUpperCase()} ready for pickup`,
    reservationId: String(reservation._id),
  });
};

// -- ride completed ---
export const queueRideCompletedNotification = async (
  reservation: IReservation,
  user: IUser,
): Promise<void> => {
  const totalOverdue = reservation.items.reduce(
    (sum, item) => sum + item.overdueCost,
    0,
  );

  const cost = (reservation.totalCost / 100).toFixed(2);

  const smsMessage = "";
  // `Hi ${user.firstName}! 3Jremy ride complete. ` +
  // `Total: P${cost}` +
  // (totalOverdue > 0
  //   ? ` (incl. P${(totalOverdue / 100).toFixed(2)} overdue charge — settle at counter).`
  //   : `. Thanks for riding with us!`);

  // Queye SMS
  await Notification.create({
    userId: user._id,
    reservationId: reservation._id,
    channel: "sms",
    event: "ride_completed",
    recipient: user.phone,
    message: smsMessage,
    status: "pending",
  });

  // Queue Email
  await Notification.create({
    userId: user._id,
    reservationId: reservation._id,
    channel: "email",
    event: "ride_completed",
    recipient: user.email,
    message: smsMessage,
    status: "pending",
  });
};
