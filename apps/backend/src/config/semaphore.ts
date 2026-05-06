// import axios from "axios";
// import { ENV } from "./env";

// const SEMAPHORE_BASE_URL = "https://api.semaphore.co/api/v4";

// export interface SemaphoreResponse {
//   message_id: number;
//   user_id: number;
//   user: string;
//   account_id: number;
//   account: string;
//   recipient: string;
//   message: string;
//   sender_name: string;
//   network: string;
//   status: string;
//   type: string;
//   credits_used: number;
// }

// export const sendSms = async (
//   to: string,
//   message: string,
// ): Promise<SemaphoreResponse> => {
//   const normalized = normalizePHNumber(to);

//   try {
//     const response = await axios.post(`${SEMAPHORE_BASE_URL}/messages`, {
//       apikey: ENV.SEMAPHORE_API_KEY,
//       number: normalized,
//       message,
//       senderName: ENV.SEMAPHORE_SENDER_NAME,
//     });

//     return response.data[0];
//   } catch (err: any) {
//     console.error("[SEMAPHORE] Error:", {
//       status: err.response?.status,
//       data: err.response?.data,
//       number: normalized,
//       sender: ENV.SEMAPHORE_SENDER_NAME,
//     });
//     throw err;
//   }
// };

// const normalizePHNumber = (phone: string): string => {
//   const digits = phone.replace(/\D/g, "");

//   if (digits.startsWith("63")) return digits;
//   if (digits.startsWith("09")) return `63${digits.slice(1)}`;
//   if (digits.startsWith("9")) return `63${digits}`;

//   return digits;
// };
