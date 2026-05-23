import { ENV } from "../config/env";
import { sendSms } from "../config/Iprogsms";
import { Notification } from "../models";

export const processPendingNotifications = async (): Promise<void> => {
  const pending = await Notification.find({ status: "pending", channel: "sms" })
    .limit(20)
    .sort({ createdAt: 1 });

  if (pending.length === 0) return;

  console.log(`[SMS] Processing ${pending.length} pending SMS`);

  for (const notification of pending) {
    try {
      if (notification.recipient === "operator") {
        notification.status = "sent";
        await notification.save();
        continue;
      }

      const result = await sendSms(
        notification.recipient,
        notification.message,
      );

      notification.status = "sent";
      notification.providerRef = String(result.message_id);
      notification.sentAt = new Date();
      await notification.save();

      console.log(
        `[SMS] Sent — event: ${notification.event} → ${notification.recipient}`,
      );
    } catch (err: any) {
      notification.status = "failed";
      notification.error = err.message;
      await notification.save();
      console.log(`[SMS] Failed → ${notification.recipient}:`, err.message);
    }
  }
};

// retry failed sms ha
export const retryFailedNotifications = async (): Promise<void> => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const failed = await Notification.find({
    status: "failed",
    channel: "sms",
    updatedAt: { $gte: twoHoursAgo },
  }).limit(20);

  if (failed.length === 0) return;

  console.log(`[SMS] Retrying ${failed.length} failed SMS notifications`);

  await Notification.updateMany(
    { _id: { $in: failed.map((n) => n._id) } },
    { $set: { status: "pending", error: null } },
  );
};


