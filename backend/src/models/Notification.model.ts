import mongoose, { Document, Schema } from "mongoose";

export type NotificationChannel = "sms" | "email";
export type NotificationEvent =
  | "booking_confirmed"
  | "ride_started"
  | "ride_warning"
  | "ride_overdue"
  | "ride_completed";

export type NotificationStatus = "pending" | "sent" | "failed";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  reservationId: mongoose.Types.ObjectId;
  channel: NotificationChannel;
  event: NotificationEvent;
  recipient: string;
  message: string;
  status: NotificationStatus;
  providerRef?: string;
  error?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotifcationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reservationId: {
    type: Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  channel: {
    type: String,
    enum: ["sms", "email"],
  },
  event: {
    type: String,
    enum: [
      "booking_confirmed",
      "ride_started",
      "ride_warning",
      "ride_overdue",
      "ride_completed",
    ],
    required: true,
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: "pending",
  },
  providerRef: {
    type: String,
    trim: true,
  },
  error: {
    type: String,
    trim: true,
  },
  sentAt: {
    type: Date,
  },
}, {timestamps: true});


NotifcationSchema.index({userId: 1});
NotifcationSchema.index({reservationId: 1});
NotifcationSchema.index({ status: 1, createdAt: 1});

export const Notification = mongoose.model<INotification>('Notification', NotifcationSchema);