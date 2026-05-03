import { Resend } from "resend";
import { ENV } from "./env";


export const resendClient = new Resend(ENV.RESEND_API_KEY);