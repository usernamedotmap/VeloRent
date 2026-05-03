import helmet from "helmet";
import { ENV } from "../config/env";
import hpp from "hpp";
import { NextFunction, Request, Response } from "express";

// -------- helmet security headers for http --------------
export const helmetConfig = helmet({
  // content securyt politcy = controls what resources can load
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: ENV.IS_PROD ? [] : null,
    },
  },

  // ----- prevents clickjacking--
  frameguard: { action: "deny" },

  // -------- prevents mime type --------
  noSniff: true,

  // hides x-powered by: express header -----
  hidePoweredBy: true,

  // ------forces https in production
  hsts: ENV.IS_PROD
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // ------ prevesnts xss in old browser--------
  xssFilter: true,

  // ------disbale dns prefetching
  dnsPrefetchControl: { allow: false },

  // ------- prevents IE from opening downlods insite contenxt
  ieNoOpen: true,

  // ----- disbales cross-origin resources pliciy leaking
  crossOriginEmbedderPolicy: false,
});

// nosql injection
// Strips $ and . from req.body, req.query, req.params
// Blocks attacks like: { "email": { "$gt": "" } }

// export const mongoSanitizer = mongoSanitize({
//   replaceWith: "_",
//   onSanitize: ({ req, key }) => {
//     console.warn(
//       `[SECURITY] NoSQL injection attempt on key "${key}" from ${req.ip}`,
//     );
//   },
// });

// ─── HPP — HTTP Parameter Pollution prevention ────────────────
// Blocks: GET /bikes?status=available&status=in_use (array pollution)
// Only allows specific fields to have multiple values
export const hppProtection = hpp({
  whitelist: ["category", "style", "sort", "fields"],
});

// ─── CSRF protection ──────────────────────────────────────────
// Since we use HTTP-only cookies, we implement the
// "Custom Request Header" CSRF mitigation pattern
// Every mutating request from the frontend must include this header
// Cross-origin attackers cannot set custom headers via forms

export const crsfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  // skind csrf if this method is include
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  if (req.path.includes("/webhook")) {
    next();
    return;
  }

  const origin = req.headers["origin"] as string | undefined;
  const referer = req.headers["referer"] as string | undefined;

  const allowedOrigins = ENV.IS_PROD
    ? [ENV.FRONTEND_ORIGIN]
    : [
        "http://localhost:5173", // Vite web
        "http://localhost:3000", // alt dev port
        "http://localhost:8081", // Expo mobile dev
      ];

  const requestSource = origin ?? (referer ? new URL(referer).origin : null);

  if (!requestSource || !allowedOrigins.includes(requestSource)) {
    console.warn(
      `[SECURITY] CSRF blocked — origin: "${requestSource}" method: ${req.method} path: ${req.path}`,
    );
    res.status(403).json({
      success: false,
      error: {
        code: "CSRF_VIOLATION",
        message: "Forbidden. Request origin not allowed.",
      },
    });
    return;
  }

  next();
};

// ─── Request size limiter ─────────────────────────────────────
// Blocks suspiciously large payloads — image uploads go to Cloudinary directly
// so the API body should never be huge
export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const MAX_BYTES = 50 * 1024;

  const contentLength = parseInt(req.headers["content-length"] || "0", 10);

  if (contentLength > MAX_BYTES) {
    res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body is too large",
      },
    });
    return;
  }
  next();
};
