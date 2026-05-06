import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/httpStatus";

const rateLimitResponse =
  (code: string, message: string) => (_req: Request, res: Response) => {
    res.status(HttpStatus.TOO_MANY).json({
      success: false,
      error: { code, message },
    });
  };

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: rateLimitResponse(
    "TOO_MANY_REQUESTS",
    "Too many requests from this IP. Please slow down.",
  ),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,
  handler: rateLimitResponse(
    "TOO _MANY_AUTH_ATTEMPTS",
    "Too many login attempts from this IP. Please wait for 15 minutes before trying again",
  ),
});

export const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitResponse(
    "TOO_MANY_WRITE_REQUESTS",
    "Too many requests. Plase wait before trying again",
  ),
});

export const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse(
    "TOO_MANY_NOTIFICATION_REQUESTS",
    "Notification limit reached. Please wait before requesting again",
  ),
});
