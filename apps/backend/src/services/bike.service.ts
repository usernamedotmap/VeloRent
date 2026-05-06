import mongoose from "mongoose";
import { Bike, IBike } from "../models";
import { Errors } from "../utils/appError";
import {
  BikeFilterInput,
  BikeStatusInput,
  CreateBikeInput,
  UpdateBikeInput,
} from "@velorent/shared";

const findBikeOrFailed = async (id: string): Promise<IBike> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Errors.badRequest("Invalid bike ID format");
  }

  const bike = await Bike.findById(id);
  if (!bike) throw Errors.notFound("Bike");
  return bike;
};

// ---- get natin all bikes with filter and pagination -------
export const getAllBikes = async (filters: BikeFilterInput) => {
  const { category, style, status, page, limit } = filters;

  const query: Record<string, unknown> = { isActive: true };
  if (category) query.category = category;
  if (style) query.style = style;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [total, bikes] = await Promise.all([
    Bike.countDocuments(query),
    Bike.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    bikes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

// get single bikd
export const getBikeById = async (id: string) => {
  const bike = await findBikeOrFailed(id as string);
  return bike;
};

// ------- create na bike ------
export const createBike = async (input: CreateBikeInput) => {
  const { serialNumber, name, category, style, imageUrls } = input;

  // check natin for exsting bike
  const existing = await Bike.findOne({ serialNumber });
  if (existing) throw Errors.duplicate("serial number");

  const bike = await Bike.create({
    serialNumber,
    name,
    category,
    style,
    imageUrls: imageUrls ?? [],
    ratePerHour: 15000,
    status: "available",
    isActive: true,
  });

  return bike;
};

export const updateBike = async (id: string, input: UpdateBikeInput) => {
  const bike = await findBikeOrFailed(id);

  // prevent changing the seriaulNumber to the bike that already exists
  if (input.serialNumber && input.serialNumber !== bike.serialNumber) {
    const existing = await Bike.findOne({ serialNumber: input.serialNumber });
    if (existing) throw Errors.duplicate("serial number");
  }

  Object.assign(bike, input);
  await bike.save();

  return bike;
};

// update for bike status
export const updateBikeStatus = async (id: string, input: BikeStatusInput) => {
  const bike = await findBikeOrFailed(id);
  const { status, note } = input;

  if (bike.status === "reserved" || bike.status === "in_use") {
    throw Errors.badRequest(
      `This bike is currently ${bike.status}. ` +
        `You cannot manually change the status until the reservation/rental is cleared.`,
    );
  }

  // can't set reserved or in_use dapat those 2 autamically changed not manually
  const manualOnlyStatuses = ["available", "maintenance", "retired"];
  if (!manualOnlyStatuses.includes(status)) {
    throw Errors.badRequest(
      `Status "${status}" is set automatically by the system.  ` +
        `You can only manually set: ${manualOnlyStatuses.join(", ")}`,
    );
  }

  bike.status = status;

  // if change the status to maintenace u should be note it
  if (status === "maintenance" && note) {
    bike.maintenanceLog.push({
      date: new Date(),
      note,
    });
  }

  await bike.save();

  return bike;
};

// ----- for admin only ---------
export const retireBike = async (id: string) => {
  const bike = await findBikeOrFailed(id);

  if (bike.status === "in_use" || bike.status === "reserved") {
    throw Errors.badRequest(
      `Cannot retire a bike with status "${bike.status}". ` +
        `Wait for the active rental to complete first.`,
    );
  }

  bike.status = "retired";
  bike.isActive = false;
  await bike.save();

  return bike;
};
