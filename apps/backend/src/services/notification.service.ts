import { sendEmail } from "../config/mailer";
import { IReservation, IUser, Notification } from "../models";
import {
  bookingConfirmedEmail,
  rideCompletedEmail,
} from "../utils/emailTemplate";
import { createDashboardNotifcation } from "./notifcationEvent.service";

export const queueBookingConfirmedNotification = async (
  reservation: IReservation,
  user: IUser,
): Promise<void> => {
  const refCode = String(reservation._id).slice(-6).toUpperCase();
  const date = new Date(reservation.scheduledStart).toLocaleString(
    "en-PH",
    {
      timeZone: "Asia/Manila",
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
  const cost = (reservation.totalCost / 100).toFixed(0);
  const bikes = reservation.items.length;

  const smsMessage = `Hi ${user.firstName}! 3Jremy booking confirmed.Ref: ${refCode} | Date: ${date}`;
  // `Hi ${user.firstName}! 3Jremy booking confirmed. ` +
  // `${bikes} bike${bikes > 1 ? "s" : ""} | ${reservation.slotHours}hr | ` +
  // `${date} | P${cost}. Show this at counter. Enjoy!`;

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

  const template = bookingConfirmedEmail({
    firstName: user.firstName,
    refCode,
    bikeCount: bikes,
    slotHours: reservation.slotHours,
    scheduledStart: date,
    totalCost: reservation.totalCost,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  } catch (err) {
    console.log(`[EMAIL] Failed to send booking confirmation:`, err);
  }

  await createDashboardNotifcation({
    recipientRole: "both",
    event: "payment_confirmed",
    title: "✅ Payment Confirmed",
    message: `Reservation ${refCode} ready for pickup`,
    reservationId: String(reservation._id),
  });
};

// -- ride completed ---
export const queueRideCompletedNotification = async (
  reservation: IReservation,
  user: IUser,
): Promise<void> => {
  const refCode = String(reservation._id).slice(-6).toUpperCase();
  const overdueCost = Math.max(0, reservation.totalCost - reservation.baseCost);

  const cost = (reservation.totalCost / 100).toFixed(2);

  const smsMessage = `Hi ${user.firstName}! 3Jremy ride complete. Total: P${cost}` +  `P${(overdueCost / 100).toFixed(2)} overdue charge — settle at counter).` ;
  // `Total: P${cost}` +
  // (overdueCost > 0
  //   ? ` (incl. P${(overdueCost / 100).toFixed(2)} overdue charge — settle at counter).`
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

  const template = rideCompletedEmail({
    firstName: user.firstName,
    refCode,
    totalCost: reservation.totalCost,
    overdueCost,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  } catch (err) {
    console.log("[EMAIL] Failed to send ride completion email:", err);
  }
};
