import mongoose, { Document, Schema } from "mongoose";

export interface IIoTDevice extends Document {
  deviceId: string;
  name: string;
  isOnline: boolean;
  lastHeartbeat: Date;
  wifiRssi?: number;
  uptime?: number;
  timerRunning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IotDeviceSchema = new Schema<IIoTDevice>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "Arduino Uno R4",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastHeartbeat: {
      type: Date,
    },
    uptime: {
      type: Number,
    },
    timerRunning: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const IoTDevice = mongoose.model<IIoTDevice>(
    'IotDevice', IotDeviceSchema
);
