import nodemailer from "nodemailer";
import { ENV } from "./env";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
});

export const verifyMailer = async (): Promise<void> => {
  if (ENV.IS_PROD) { 
    console.log("Nodemailer verification skipped because IS_PROD is true");
    return;
  }
  try {
    await transporter.verify();
    console.log("Nodemailer connected to gmail");
  } catch (err) {
    console.log("Nodemailer connection failed:", err);
  }
};

export const sendEmail = async (params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}): Promise<void> => {
    if (ENV.IS_PROD) {
        console.log(`[MAILER] Email sending skipped in production for ${params.to}`);
        return;
    }

    const { to, subject, html, text } = params;

    try {
        const info = await transporter.sendMail({
            from: `"${ENV.GMAIL_FROM_NAME}" <${ENV.GMAIL_USER}>`,
            to,
            subject,
            html,
            text: text ?? html.replace(/<[^>]*>/g, ''),
        });

        console.log(`[MAILER] Email sen to ${to} - ID: ${info.messageId}`);
    } catch (err: any) {
        console.log('[MAILER] Failed to send email:', err.message);
        throw err;
    }
};

