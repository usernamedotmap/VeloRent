// import axios from "axios";
// import { ENV } from "./env";

// export const BASE_URL = ENV.INFORBIP_BASE_URL;
// export const API_KEY = ENV.INFOBIP_API_KEY;
// export const SENDER = ENV.INFOBIP_SENDER_NAME;

// export interface SmsResponse {
//   messageId?: string;
//   bulkId?: string;
//   to: string;
//   status?: string;
//   provider: "infobip-v3" | "infobip-v2";
// }

// export const sendSms = async (
//   to: string,
//   message: string,
// ): Promise<SmsResponse> => {
//   const normalized = normalizePHNumber(to);
//   const fullNumber = `${normalized}`;

//   // v3 first
//   try {
//     console.log(`${BASE_URL}/sms/3/messages`);
//     const res = await axios.post(
//       `${BASE_URL}/sms/3/messages`,
//       {
//         messages: [
//           {
//             sender: SENDER,
//             destinations: [{ to: fullNumber }],
//             content: { text: message },
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `App ${API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       },
//     );

//     const msg = res.data?.messages?.[0];

//     return {
//       messageId: msg?.messageId,
//       bulkId: res.data?.bulkId,
//       to: normalized,
//       status: msg?.status.name,
//       provider: "infobip-v3",
//     };
//   } catch (v3Err: any) {
//     if (v3Err.response?.status === 401) {
//       throw v3Err;
//     }
//     console.log("[INFOBIP] v3 failed, falling back to v2...", {
//       status: v3Err.response?.status,
//       data: v3Err.response?.data,
//     });

//     // falback to v2
//     try {
//       console.log( `${BASE_URL}/sms/2/text/advanced`,)
//       const res = await axios.post(
//         `${BASE_URL}/sms/2/text/advanced`,
//         {
//           messages: [
//             {
//               from: SENDER,
//               destinations: [{ to: fullNumber }],
//               text: message,
//             },
//           ],
//         },
//         {
//           headers: {
//             Authorization: `App ${API_KEY}`,
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           timeout: 10000,
//         },
//       );

//       const msg = res.data?.messages?.[0];

//       return {
//         messageId: msg?.messageId,
//         bulkId: res.data?.bulkId,
//         to: normalized,
//         status: msg?.status?.name,
//         provider: "infobip-v2",
//       };
//     } catch (v2Err: any) {
//       console.log("[INFOBIP] Both v3 and v2 failed", {
//         v3: v3Err.response?.data,
//         v2: v2Err.response?.data,
//         number: normalized,
//       });

//       throw v2Err;
//     }
//   }
// };


// const normalizePHNumber  = (phone: string): string => {
//     const digits = phone.replace(/\D/g, "");

//     if (digits.startsWith("63")) return digits;
//     if (digits.startsWith("09")) return `63${digits.slice(1)}`;
//     if (digits.startsWith("9")) return `63${digits}`;

//     return digits;
// }
