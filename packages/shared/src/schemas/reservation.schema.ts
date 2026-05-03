import { z } from "zod";

export const SlotHours = [1, 2, 3] as const;
export const BookingChannels = ["online", "walk_in"] as const;

export const CreateReservationSchema = z.object({
  bikeIds: z
    .array(z.string().min(1))
    .min(1, "At least one bike is required")
    .max(5, "Maximum 5 bikes per reservation"),
  slotHours: z.union([z.literal(1), z.literal(2), z.literal(3)], {
    errorMap: () => ({ message: "Slout must be 1, 2, or 3 hours" }),
  }),
  scheduledStart: z.string().datetime("Invalid date format"),
  notes: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

export const WalkInReservationSchema = z.object({
  bikeIds: z
    .array(z.string().min(1))
    .min(1, "At least one bike is required")
    .max(5, "Maximum 5 bikes per reservation"),
  slotHours: z.union([z.literal(1), z.literal(2), z.literal(3)], {
    errorMap: () => ({ message: "Slot must be 1, 2, or 3hours" }),
  }),
  userId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type WalkInReservationInput = z.infer<typeof WalkInReservationSchema>;

export const CancelReservationSchema = z.object({
  cancellationReason: z
    .string()
    .min(3, "Plase provide a reason")
    .max(500, "Reason too big"),
});

export type CancelReservationInput = z.infer<typeof CancelReservationSchema>;

export const StartItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export type StartItemInput = z.infer<typeof StartItemSchema>;

export const CompleteItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export type CompleteItemInput = z.infer<typeof CompleteItemSchema>;

export const ReservationFilterSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "overdue",
    ])
    .optional(),
  channel: z.enum(["online", "walk_in"]).optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().max(50).default(10),
});

export type ReservationFilterInput = z.infer<typeof ReservationFilterSchema>;
