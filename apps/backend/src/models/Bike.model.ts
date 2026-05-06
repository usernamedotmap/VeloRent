import mongoose, { Document, Schema } from "mongoose";

export type BikeCategory = "solo" | "kid" | "family";
export type BikeStyle = "standard" | "mountain" | "bmx";
export type BikeStatus =
  | "available"
  | "reserved"
  | "in_use"
  | "maintenance"
  | "retired";

interface IMaintenanceLog {
  date: Date;
  note: string;
  technicianId?: mongoose.Types.ObjectId;
}

export interface IBike extends Document {
  serialNumber: string;
  name: string;
  category: BikeCategory;
  style: BikeStyle;
  status: BikeStatus;
  ratePerHour: number;
  imageUrls: string[];
  totalTrips: number;
  maintenanceLog: IMaintenanceLog[];
  isActive: boolean;
  createdAt: Date;
  updated: Date;
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    date: {
      type: Date,
      default: Date.now(),
    },
    note: {
      type: String,
      required: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false },
);

const BikeSchema = new Schema<IBike>(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
        type: String,
        enum: ["solo", "kid", "family"],
        required: true
    },
    style: {
        type: String,
        enum: ['standard', 'mountain', 'bmx'],
        required: true
    },
    status: {
      type: String,
      enum: ["available", "reserved", "in_use", "maintenance", "retired"],
      default: "available",
    },
  
    ratePerHour: {
      type: Number,
      required: true,
      default: 1500,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
  
    totalTrips: {
      type: Number,
      default: 0,
    },
    maintenanceLog: [MaintenanceLogSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

BikeSchema.index({ location: "2dsphere" });
BikeSchema.index({ stationId: 1, status: 1 });

export const Bike = mongoose.model<IBike>("Bike", BikeSchema);
