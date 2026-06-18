import crypto from "crypto";
import { Payment, Reservation, User } from "../models";
import { Errors } from "../utils/appError";
import { paymongoClient } from "../config/paymongo";
import { ENV } from "../config/env";
import { queueBookingConfirmedNotification } from "./notification.service";
import { emitToRole } from "../config/socket";
import { createDashboardNotifcation } from "./notifcationEvent.service";

// gcash srouce to make natin chargeable
const createPaymentFromSource = async (
  sourceId: string,
  amount: number,
  reservationId: string,
): Promise<void> => {
  await paymongoClient.post("/payments", {
    data: {
      attributes: {
        amount,
        currency: "PHP",
        source: {
          id: sourceId,
          type: "source",
        },
        description: `Velorent booking ${reservationId}`,
      },
    },
  });
};

/// initialize payment intent
// called after the customer create resrvation
// return client_key so frontend can render paymongo payment UI
export const initializePayment = async (
  userId: string,
  input: { reservationId: string },
) => {
  const { reservationId } = input;

  // load converstaition
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw Errors.notFound("Reservation");

  //only the owner can pay
  if (String(reservation.userId) !== userId) {
    throw Errors.forbidden("This is not your reservation.");
  }

  // must be pending - can't pay twice
  if (reservation.status !== "pending") {
    throw Errors.badRequest(
      `Reservation is already "${reservation.status}". Payment not required.`,
    );
  }

  // check no  existing pending payment already exists
  const existingPayment = await Payment.findOne({
    reservationId,
    status: { $in: ["pending", "paid"] },
  });

  if (existingPayment?.status === "paid") {
    throw Errors.badRequest(`This reservation is already paid.`);
  }

  if (existingPayment?.status === "pending") {
    console.log("[PAYMENT] returning existing pending payment intent");
    return {
      clientKey: existingPayment.clientKey,
      payment: String(existingPayment._id),
      amount: existingPayment.amount,
    };
  }

  // create paymongo payment intent -----
  const paymentMethodMap: Record<string, string[]> = {
    gcash: ["gcash"],
    paymaya: ["paymaya"],
    card: ["card"],
  };

  const response = await paymongoClient.post("/payment_intents", {
    data: {
      attributes: {
        amount: reservation.baseCost,
        payment_method_allowed: ["gcash", "paymaya", "card", "qrph"], // for now allow all methods - let user choose in paymongo UI
        currency: "PHP",
        description: `VeloRent booking ${reservationId}`,
        statement_descriptor: "VELORENT", 
        metadata: {
          reservationId: String(reservationId),
          userId,
        },
      },
    },
  });

  const intent = response.data.data;

  // --s save payment to DB
  const payment = await Payment.create({
    reservationId,
    userId,
    provider: "paymongo",
    providerRef: intent.id,
    clientKey: intent.attributes.client_key,
    amount: reservation.baseCost,
    currency: "PHP",
    status: "pending",
  });

  // link payment to reservation
  reservation.paymentId = payment._id as any;
  await reservation.save();

  return {
    clientKey: intent.attributes.client_key,
    paymentId: payment._id,
    amount: reservation.baseCost,
  };
};

// verify paymongo webhook singature
// PayMongo signs every webhook with HMAC-SHA256
// We MUST verify this — otherwise anyone can fake a payment
export const verifyWebhookSignature = async (
  rawBody: Buffer,
  signature: string,
): Promise<boolean> => {
  try {
    // PayMongo signature format: "t=timestamp,te=hash,li=hash"
    const isProd = ENV.IS_PROD
      ? ENV.PAYMONGO_WEBHOOK_SECRET
      : ENV.TEST_PAYMONGO_WEBHOOK_SECRET;
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
    const hash = parts.find((p) => p.startsWith("te="))?.split("=")[1];

    if (!timestamp || !hash) return false;

    // reconstruct teh signed payload
    const singedPayload = `${timestamp}.${rawBody.toString()}`;

    //compute expected signature
    const expected = crypto
      .createHmac("sha256", isProd)
      .update(singedPayload)
      .digest("hex");

    // timing safe comparison prevents ba sas timign atacks
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  } catch {
    return false;
  }
};

// handle a webhook
// PayMongo POST to /api/payments/webhook on every payment event
export const handleWebhook = async (
  rawBody: Buffer,
  signature: string,
): Promise<void> => {
  // 1. Verify Signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw Errors.forbidden("Invalid webhook signature");
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (err) {
    console.log("[WEBHOOK] Failed to parse body");
    return;
  }

  const eventType = event.data?.attributes?.type as string;
  console.log("[WEBHOOK] Event type:", eventType);

  // 2. Handle source.chargeable (GCash/Maya Flow)
  if (eventType === "source.chargeable") {
    const sourceData = event.data?.attributes?.data;
    const sourceId = sourceData?.id; // This is the src_xxxx ID
    const amount = sourceData?.attributes?.amount;
    const reservationId = sourceData?.attributes?.metadata?.reservationId;

    if (!sourceId || !amount) {
      console.log("[WEBHOOK] Missing sourceId or amount");
      return;
    }

    try {
      await createPaymentFromSource(
        sourceId,
        amount,
        reservationId ?? "unknown",
      );
      console.log("[WEBHOOK] Payment created from source ✅");
    } catch (err: any) {
      console.log(
        "[WEBHOOK] Failed to create payment from source:",
        err?.response?.data,
      );
    }
    return; // Exit after handling source
  }

  // 3. Handle payment.paid / payment.failed (Final Status)
  if (!["payment.paid", "payment.failed"].includes(eventType)) {
    return;
  }

  const paymentData = event.data?.attributes?.data?.attributes;
  const intentId = paymentData?.payment_intent_id as string | undefined;
  const metaData = paymentData?.metadata as Record<string, string> | undefined;
  const reservationId = metaData?.reservationId;

  // 4. FIND THE PAYMENT RECORD (The consolidated fix)
  let paymentRecord = null;

  if (intentId) {
    // Card payments always have an intentId
    paymentRecord = await Payment.findOne({ providerRef: intentId });
  } else if (reservationId) {
    // GCash/Source flow might not have intentId in the metadata, use reservationId
    paymentRecord = await Payment.findOne({
      reservationId,
      status: "pending",
    });
    console.log("[WEBHOOK] Searching by reservationId:", reservationId);
  }

  if (!paymentRecord) {
    console.log("[WEBHOOK] No payment record found in DB for:", {
      intentId,
      reservationId,
    });
    return;
  }

  // 5. Update Statuses
  if (eventType === "payment.paid") {
    paymentRecord.status = "paid";
    paymentRecord.paidAt = new Date();
    paymentRecord.webhookPayload = event;
    await paymentRecord.save();

    // Confirm the Reservation
    const targetResId = reservationId ?? String(paymentRecord.reservationId);
    const reservation = await Reservation.findById(targetResId);

    if (reservation && reservation.status === "pending") {
      reservation.status = "confirmed";
      await reservation.save();
      console.log("[WEBHOOK] Reservation confirmed ✅");

      const emits = await createDashboardNotifcation({
        recipientRole: "both",
        event: "payment_confirmed",
        title: "✅ Payment Confirmed",
        message: `Reservation ${String(reservation._id).slice(-6).toUpperCase()} is confirmed and ready`,
        reservationId: String(reservation._id),
        metadata: { amount: paymentRecord.amount ?? null },
      });

      const socketEvent = "notification:payment-confirmed";
      for (const payload of emits) {
        emitToRole("both", socketEvent, {
          ...payload,
          timestamp: payload.timestamp ?? new Date().toISOString(),
        });
      }

      const user = await User.findById(reservation.userId);
      if (user) {
        await queueBookingConfirmedNotification(reservation, user as any);
      }
    }
  } else if (eventType === "payment.failed") {
    paymentRecord.status = "failed";
    paymentRecord.failureReason = paymentData?.description ?? "Payment failed";
    paymentRecord.webhookPayload = event;
    await paymentRecord.save();
    console.log("[WEBHOOK] Payment marked failed ❌");
  }
};

// process srefund
// triiger to whena  confirmed online rservation is cancceleed
export const processRefund = async (paymentId: string): Promise<void> => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw Errors.notFound("Payment");

  if (payment.status !== "paid") {
    throw Errors.badRequest(
      `Cannot refund a payment with status "${payment.status}".`,
    );
  }

  // get the paymongo pyament id from the intent
  // need to fetch the intent to get the actualy payment id
  const intentResponse = await paymongoClient.get(
    `/payment_intents/${payment.providerRef}`,
  );

  const intent = intentResponse.data.data;
  const payments = intent.attributes.payments as any[];

  if (!payments || payments.length === 0) {
    throw Errors.internal("No payment found on this intent to refund.");
  }

  const paymongoPaymentId = payments[0].id;

  // create refund on paymongo
  const refundResponse = await paymongoClient.post("/refunds", {
    data: {
      attributes: {
        amount: payment.amount,
        payment_id: paymongoPaymentId,
        reason: "requested_by_customer",
        notes: "Customer cancelled reservation",
      },
    },
  });

  const refund = refundResponse.data.data;

  payment.status = "refunded";
  payment.refundedAt = new Date();
  payment.refundRef = refund.id;
  await payment.save();
};

// --- get payment by reservation
export const getPaymentByReservation = async (
  reservationId: string,
  userId: string,
  role: string,
) => {
  const payment = await Payment.findOne({ reservationId })
    .populate("reservationId", "status slotHours scheduledStart")
    .populate("userId", "firstName lastName email");

  if (!payment) throw Errors.notFound("Payment");

  // customers can only see their own payment
  if (role === "customers" && String(payment.userId) !== userId) {
    throw Errors.forbidden("You do not have access to this payment");
  }

  return payment;
};
