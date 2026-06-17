import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "customer" | "operator" | "admin";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  rfid: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  notifications: {
    sms: boolean;
    email: boolean;
  };
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    rfid: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ["customer", "operator", "admin"],
      default: "customer",
    },
    avatarUrl: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notifications: {
      sms: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);



export const User = mongoose.model<IUser>("User", UserSchema);
