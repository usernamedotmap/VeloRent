import axios from "axios";
import { ENV } from "./env";

const IPROGSMS_BASE_URL = "https://www.iprogsms.com/api/v1";

export interface IprogSmsResponse {
  status: number;
  message: string;
  message_id: string;
}

const normalizePHNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("639")) return `0${digits.slice(2)}`;
  if (digits.startsWith("63")) return `0${digits.slice(2)}`;
  if (digits.startsWith("09")) return digits;
  if (digits.startsWith("9")) return `0${digits}`;
  return digits;
};

export const sendSms = async (
  to: string,
  message: string,
): Promise<IprogSmsResponse> => {
  const normalized = normalizePHNumber(to);

  try {
    const { data } = await axios.post<IprogSmsResponse>(
      `${IPROGSMS_BASE_URL}/sms_messages`,
      {
        api_token: ENV.IPROGSMS_API_KEY,
        phone_number: normalized,
        message,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log(`[IPROGSMS] Sent to ${normalized} - ID: ${data.message_id}`);
    return data;
  } catch (err: any) {
    console.log("[IPROGSMS] Error sending to", {
      status: err.response?.status,
      data: err.response?.data,
      number: normalized,
    });
    throw err;
  }
};

export const checkSmsStatus = async (): Promise<{ credits: number }> => {
  const { data } = await axios.get(`${IPROGSMS_BASE_URL}/sms_messages/status`, {
    params: {
      api_token: ENV.IPROGSMS_API_KEY,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const checkCredits = async (): Promise<{ credits: number }> => {
  const { data } = await axios.get(`${IPROGSMS_BASE_URL}/account/sms_credits`, {
    params: { api_token: ENV.IPROGSMS_API_KEY },
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
