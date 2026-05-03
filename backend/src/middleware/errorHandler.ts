import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../utils/httpStatus";
import { ENV } from "../config/env";
import { AppError } from "../utils/appError";

/// ______ so maybe tomorrow type guards _____

const isMongooseDuplicate = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as any).code === 11000;

const isMongooseValidation = (err: unknown): boolean =>
  (err as any)?.name === "ValidationError";

const isMongooseCastError = (err: unknown): boolean =>
  (err as any)?.name === "CastError";

const isJwtError = (err: unknown): boolean =>
  ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
    (err as any)?.name,
  );

// ___extract duplicate key field name ___

const getDuplicatedField = (err: any): string => {
  const match = err?.message?.match(/index: (\w+)_1/);
  return match ? match[1] : "field";
};
/// logger
const logError = (err: unknown, req: Request): void => {
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: (err as any)?.message,
    stack: ENV.IS_PROD ? undefined : (err as any)?.stack,
  });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) logError(err, req);
    res.status(err.statuscode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // for mongodb duplicate key
  if (isMongooseDuplicate(err)) {
    const field = getDuplicatedField(err);
    res.status(HttpStatus.CONFLICT).json({
      success: false,
      error: {
        code: "DUPLICATE_FIELD",
        message: `This ${field} is already taken`,
      },
    });
    return;
  }

  // for mongoose schema validation
  if (isMongooseValidation(err)) {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message,
    );
    res.status(HttpStatus.UNPROCESSABLE).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.join(", "),
      },
    });
    return;
  }

  if (isMongooseCastError(err)) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "Invalid ID format",
      },
    });
    return;
  }

  if (isJwtError(err)) {
    const expired = (err as any).name === `TokenExpiredError`;
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: {
        code: expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
        message: expired ? "Sessison expired. Please Refresh" : "Invalid token",
      },
    });
    return;
  }

  console.log("[UNHANDLED ERROR", {
    message: (err as any)?.message,
    stack: (err as any)?.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(HttpStatus.INTERNAL).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      ...(ENV.IS_PROD ? {} : { stack: (err as any)?.stack }),
    },
  });
};
