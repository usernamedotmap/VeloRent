import { Router } from "express";
import express from "express";
import {
  getPaymentHandler,
  initializePaymentController,
  refundPaymentController,
  webhookHandler,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { writeLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { InitializePaymentSchema } from "@velorent/shared";

const paymentRoutes = Router();

// -- webbohook - raw body required
/// -- pyamngo needs the raw buffer for sinagure verifiation
// paymentRoutes.post(
//   "/webhook",
//   express.raw({
//     type: "*/*",
//   }),
//   webhookHandler,
// );

// --- customer --
paymentRoutes.post(
  "/initialize",
  authenticate,
  authorize("customer"),
  writeLimiter,
  validate(InitializePaymentSchema),
  initializePaymentController,
);

paymentRoutes.get("/:reservationId", authenticate, getPaymentHandler);

// --- admin only ---
paymentRoutes.post(
  "/refund/:paymentId",
  authenticate,
  authorize("admin"),
  refundPaymentController,
);



export default paymentRoutes;
