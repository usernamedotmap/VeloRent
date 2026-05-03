import mongoose, { Document, Schema } from "mongoose";

export type PaymentProvider = "paymongo" | "cash" | "beep";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export interface IPayment extends Document {
  reservationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: PaymentProvider;
  providerRef?: string;
  clientKey?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  refundRef?: string;
  webhookPayload?: Record<string, unknown>;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["paymongo", "cash", 'beep'],
      required: true,
    },
    providerRef: {
      type: String,
      trim: true,
    },
    clientKey: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "PHP",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
    webhookPayload: {
      type: Schema.Types.Mixed,
    },
    refundedAt: {
      type: Date,
    },
    refundRef: {
      type: String,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({ reservation: 1 }, { unique: true });
PaymentSchema.index({ providerRef: 1 }, { sparse: true });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
