import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import * as PaymentService from "../services/payment.service";
import { HttpStatus } from "../utils/httpStatus";

export const initializePaymentController = asyncHandler(async (req, res) => {
  const result = await PaymentService.initializePayment(
    req.user!.userId,
    req.body,
  );

  res.status(HttpStatus.CREATED).json({
    success: true,
    data: result,
  });
});

// paymongo sends a raw body - must not use express.json() on this route
export const webhookHandler = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["paymongo-signature"] as string;

    if (!signature) {
      res.status(400).json({
        message: "Missing signature header",
      });
      return;
    }

    let rawBody: Buffer;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body
    } else {
      rawBody = Buffer.from(JSON.stringify(req.body));
    }

    await PaymentService.handleWebhook(req.body as Buffer, signature);
    res.status(200).json({ received: true });
    

  } catch (err: any) {
    console.log("[WEBHOOK ERROR]", err);
    res.status(200).json({ received: false });
  }
};

export const getPaymentHandler = asyncHandler(async (req, res) => {
  const payment = await PaymentService.getPaymentByReservation(
    req.params.reservationId,
    req.user!.userId,
    req.user!.role,
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data: payment,
  });
});

export const refundPaymentController = asyncHandler(async (req, res) => {
  await PaymentService.processRefund(req.params.paymentId);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "Refund processed  successfully.",
    },
  });
});
