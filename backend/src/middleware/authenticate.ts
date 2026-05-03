import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service";
import { JwtPayload, verifyAccessToken } from "../utils/jwt";
import { HttpStatus } from "../utils/httpStatus";
import { setAuthCookies } from "../utils/cookie";
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export  const extractToken = (req: Request): string | null => {
  const fromCookie = req.cookies?.accessToken as string | undefined;

  if (fromCookie) return fromCookie;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractToken(req);
  const refreshToken = req.cookies?.refreshToken;

  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: {
        code: "NO_TOKEN",
        message: "Authentication required. Please log in.",
      },
    });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err: any) {
    const isExpired = err.name === "TokenExpiredError";

    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: {
        code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
        message: isExpired
          ? "Session expired. Please refresh your token."
          : "Invalid token. Please log in again.",
      },
    });
  }
};

export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyAccessToken(token);
  } catch {}

  next();
};
