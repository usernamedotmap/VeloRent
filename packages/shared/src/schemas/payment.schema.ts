import z from "zod";

// export const PaymentMethods = ["gcash", "paymaya", "card"] as const;

// ---- initialize payment

export const InitializePaymentSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  // paymentMethod: z.enum(PaymentMethods, {
  //   errorMap: () => ({
  //     message: "Payment method must be gcash, paymaya, or card",
  //   }),
  // }),
});

export type InitializePaymentInput = z.infer<typeof InitializePaymentSchema>;
