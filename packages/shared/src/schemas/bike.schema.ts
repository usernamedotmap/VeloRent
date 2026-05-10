import {z} from "zod";

export const BikeCategories = ["solo", "kid", "family"] as const;
export const BikeStyles = ["standard", "mountain", "bmx"] as const;
export const AutoStatuses = ["reserved", "in_use"] as const;
export const ManualStatuses = ["available", "maintenance", "retired"] as const;

export const CreateBikeSchema = z.object({
  serialNumber: z
    .string()
    .min(3, "Serial number too short")
    .max(50, "Serial number too long")
    .trim(),
  name: z.string().min(2).max(100).trim(),
  category: z.enum(BikeCategories, {
    errorMap: () => ({ message: "Invalid bike category" }),
  }),
  style: z.enum(BikeStyles, {
    errorMap: () => ({ message: "Invalid bike style" }),
  }),
  imageUrls: z.array(z.string().url()).default([]),
});

export type CreateBikeInput = z.infer<typeof CreateBikeSchema>;

export const UpdateBikeSchema = CreateBikeSchema.partial().extend({
  status: z.enum(ManualStatuses).optional(),
});

export type UpdateBikeInput = z.infer<typeof UpdateBikeSchema>;

export const BikeFilterSchema = z.object({
  category: z.enum(BikeCategories).optional(),
  style: z.enum(BikeStyles).optional(),
  status: z.enum(ManualStatuses).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type BikeFilterInput = z.infer<typeof BikeFilterSchema>;

export const BikeStatusSchema = z
  .object({
    status: z.enum(ManualStatuses, {
      errorMap: () => ({
        message:
          "You can only manually set: available, maintenance, or retired. " +
          "reserved and in_use are set automatically by the system.",
      }),
    }),
    note: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === "maintenance" && !data.note?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "A note is required when setting a bike to maintenance",
    path: ["note"],
    },
  );

export type BikeStatusInput = z.infer<typeof BikeStatusSchema>;