import mongoose, { Schema } from "mongoose";

export type DashboardNotificationEvent =
  | "new_reservation"
  | "payment_confirmed"
  | "ride_warning"
  | "ride_overdue"
  | "ride_started"
  | "ride_completed"
  | "reservation_cancelled";

export type NotificationRecipientRole = "admin" | "operator";

export interface InotificationEvent extends Document {
  recipientRole: NotificationRecipientRole;
  recipientId?: mongoose.Types.ObjectId;
  event: DashboardNotificationEvent;
  title: string;
  message: string;
  reservationId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationEventSchema = new Schema<InotificationEvent>(
  {
    recipientRole: {
      type: String,
      enum: ["admin", "operator"],
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    event: {
      type: String,
      enum: [
        "new_reservation",
        "payment_confirmed",
        "ride_warning",
        "ride_overdue",
        "ride_started",
        "ride_completed",
        "reservation_cancelled",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

NotificationEventSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
NotificationEventSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

NotificationEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

export const NotificationEventModel = mongoose.model<InotificationEvent>(
  "NotificationEvent",
  NotificationEventSchema,
);
