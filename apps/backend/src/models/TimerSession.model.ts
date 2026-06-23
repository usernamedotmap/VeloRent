import mongoose, { Document, Schema } from "mongoose";

export interface ITimerSession extends Document {
  reservationId: mongoose.Types.ObjectId;
  reservationItemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bikeId: mongoose.Types.ObjectId;
  slotSeconds: number;
  elapsedSeconds: number;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  isOverdue: boolean;
  overdueSeconds: number;
  overriddenBy?: mongoose.Types.ObjectId;
  overrideNote?: string;
  warningSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimerSessionSchema = new Schema<ITimerSession>(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    reservationItemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bikeId: {
      type: Schema.Types.ObjectId,
      ref: "Bike",
      required: true,
    },
    slotSeconds: {
      type: Number,
      required: true,
    },
    elapsedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    overdueSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    overriddenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    overrideNote: {
      type: String,
      trim: true,
    },
    warningSentAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// ✅ SAFE UNIQUE CONSTRAINT: Ensures a single rental item can't have duplicate concurrent tracking sessions
TimerSessionSchema.index({ reservationItemId: 1 }, { unique: true });
TimerSessionSchema.index({ isActive: 1, isOverdue: 1 });

export const TimerSession = mongoose.model<ITimerSession>("TimerSession", TimerSessionSchema);