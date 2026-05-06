import axios from "axios";
import { ENV } from "./env";

const isProd = ENV.IS_PROD
  ? ENV.PAYMONGO_SECRET_KEY
  : ENV.TEST_PAYMONGO_SECRET_KEY;
const encoded = Buffer.from(`${isProd}:`).toString("base64");

export const paymongoClient = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  headers: {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// typs mathcing paymongo api responses
export interface PayMongoPaymentIntent {
  id: string;
  type: "payment_intent";
  attributes: {
    amount: number;
    currency: string;
    status:
      | "awaiting_payment_method"
      | "awaiting_next_action"
      | "processing"
      | "succeeded"
      | "cancelled";
    client_key: string;
    description: string;
    payment_method_allowed: string[];
    payments: any[];
    metaData: Record<string, string>;
  };
}

export interface PayMongoPayment {
  id: string;
  type: "payment";
  attributes: {
    amount: number;
    status: "paid" | "failed";
    fee: number;
    currency: string;
    description: string;
    source: {
      type: string;
      id: string;
    };
    metaData: Record<string, string>;
  };
}

export interface PayMongoWebhookEvent {
  id: string;
  type: "webhook";
  attributes: {
    type: "payment.paid" | "payment.failed" | "payment_intent.succeeded";
    data: {
      attributes: PayMongoPayment["attributes"] & {
        payment_intent_id?: string;
        metadata?: Record<string, string>;
      };
    };
  };
}
