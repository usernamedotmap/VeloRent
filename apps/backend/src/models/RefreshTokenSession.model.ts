import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshTokenSession extends Document {
  userId: string;
  tokenHash: string;
  deviceId: string;
  isRevoked: boolean;
  expiresAt: Date;
  lastUsedAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSessionSchema = new Schema<IRefreshTokenSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // TTL index for automatic cleanup
      // MongoDB will automatically delete documents 0 seconds after expiresAt
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Create TTL index to auto-delete expired tokens
RefreshTokenSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSessionSchema.index({ userId: 1, deviceId: 1});

export const MAX_SESSION_PER_USER = 5;

export const RefreshTokenSession = mongoose.model<IRefreshTokenSession>(
  "RefreshTokenSession",
  RefreshTokenSessionSchema,
  "refresh_token_sessions",
);
