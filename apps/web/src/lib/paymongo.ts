import axios from "axios";

const PAYMONGO_BASE = "https://api.paymongo.com/v1";
const IS_PROD = import.meta.env.VITE_NODE_ENV === "production";

// public key her
const getAuthHeader = () => {
  const key = IS_PROD
    ? import.meta.env.VITE_PAYMONGO_PUBLIC_KEY
    : import.meta.env.VITE_PAYMONGO_TEST_PUBLIC_KEY;
  return `Basic ${btoa(`${key}:`)}`;
};

export const paymongoPublic = axios.create({
  baseURL: PAYMONGO_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// add auth header on every request
paymongoPublic.interceptors.request.use((config) => {
  config.headers.Authorization = getAuthHeader();
  return config;
});

// payment method
export interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

export interface BillingDetails {
  name: string;
  email: string;
  phone: string;
}

export const createMayaPaymentMethod = async (billing: BillingDetails) => {
  const { data } = await paymongoPublic.post("/payment_methods", {
    data: {
      attributes: {
        type: "paymaya",
        billing: {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
        },
      },
    },
  });
  return data.data.id as string;
};

export const createPaymentMethod = async (
  card: CardDetails,
  billing: BillingDetails,
) => {
  const { data } = await paymongoPublic.post("/payment_methods", {
    data: {
      attributes: {
        type: "card",
        details: {
          card_number: card.cardNumber.replace(/\s/g, ""),
          exp_month: card.expMonth,
          exp_year: card.expYear,
          cvc: card.cvc,
        },
        billing: {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
        },
      },
    },
  });
  return data.data.id as string;
};

// qrph payment method
export const createQRPhPaymentMethod = async (billing: BillingDetails) => {
  const { data } = await paymongoPublic.post("/payment_methods", {
    data: {
      attributes: {
        type: "qrph",
        billing: {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
          address: {
            line1: "N/A",
            city: "Manila",
            state: "Metro Manila",
            postal_code: "1000",
            country: "PH",
          },
        },
      },
    },
  });

  return data.data.id as string;
};

// attach payment method to payment intent
export const attachPaymentMethod = async (
  intentId: string,
  methodId: string,
  clientKey: string,
  returnUrl: string,
) => {
  const { data } = await paymongoPublic.post(
    `/payment_intents/${intentId}/attach`,
    {
      data: {
        attributes: {
          payment_method: methodId,
          client_key: clientKey,
          return_url: returnUrl,
        },
      },
    },
  );
  return data.data;
};

// retrieve payment intent status
export const retrievePaymentIntent = async (
  intentId: string,
  clientKey: string,
) => {
  const { data } = await paymongoPublic.get(
    `/payment_intents/${intentId}?client_key=${clientKey}`,
  );
  return data.data;
};

// create gcahs/ maya soruce dito
export const createEWalletSource = async (
  type: "gcash" | "paymaya",
  amount: number,
  billing: BillingDetails,
  returnUrl: string,
  failUrl: string,
  reservationId: string,
) => {
  const { data } = await paymongoPublic.post("/sources", {
    data: {
      attributes: {
        type,
        amount,
        currency: "PHP",
        redirect: {
          success: returnUrl,
          failed: failUrl,
        },
        billing: {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
        },
        metadata: {
          reservationId,
        },
      },
    },
  });
  return data.data;
};

// extract intent ID fron client key
export const getIntentId = (clientKey: string): string =>
  clientKey.split("_client_")[0];
