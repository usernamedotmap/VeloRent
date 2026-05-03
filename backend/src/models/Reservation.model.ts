import mongoose, { Document, Schema } from "mongoose";

export type ReservationStatus =
  | "pending" // online: waiting for payment | walk-in: just created
  | "confirmed" // payment received, waiting for operator to start
  | "active" // at least one bike has been started
  | "completed" // all bikes returned
  | "cancelled" // cancelled before any bike started
  | "overdue"; // at least one bike exceeded slot time

export type ItemStatus =
  | "waiting" // confirmed but operator hasn't started this bike yet
  | "active" // operator started this bike, timer running
  | "completed" // this bike returned
  | "overdue"; // this bike exceeded slot time

export type SlotHours = 1 | 2 | 3;
export type BookingChannel = "online" | "walk_in";

export interface IReservationItem extends Document {
  bikeId: mongoose.Types.ObjectId;
  status: ItemStatus;
  actualStart?: Date;
  actualEnd?: Date;
  overdueCost: number;
  timerSessionId?: mongoose.Types.ObjectId;
}

export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId;
  channel: BookingChannel;
  status: ReservationStatus;
  slotHours: SlotHours;
  items: IReservationItem[];
  baseCost: number;
  totalCost: number;
  scheduledStart: Date;
  paymentId?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationItemSchema = new Schema<IReservationItem>({
  bikeId: {
    type: Schema.Types.ObjectId,
    ref: "Bike",
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "active", "completed", "overdue"],
    waiting: "waiting",
  },
  actualStart: {
    type: Date,
  },
  actualEnd: {
    type: Date,
  },
  overdueCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  timerSessionId: {
    type: Schema.Types.ObjectId,
    ref: "TimerSession",
  },
});

const ReservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: String,
      enum: ["online", "walk_in"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "overdue",
      ],
      default: "pending",
    },
    slotHours: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    items: {
      type: [ReservationItemSchema],
      required: true,
      validate: {
        validator: (items: IReservationItem[]) =>
          items.length >= 1 && items.length <= 5,
        message: "A reservation must have between 1 and 5 bikes",
      },
    },
    baseCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    scheduledStart: {
      type: Date,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

ReservationSchema.index({ userId: 1, status: 1});
ReservationSchema.index({ status: 1, scheduledStart: 1});
ReservationSchema.index({ 'items.bikeId': 1, status: 1});
ReservationSchema.index({ channel: 1, status: 1});

export const Reservation = mongoose.model<IReservation>(
  "Reservation",
  ReservationSchema,
);
