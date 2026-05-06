import { ENV } from "../config/env";
import { UserRole } from "../models";
import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// -------- sign-------
export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    // expiresIn: ENV.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
    expiresIn: Number(ENV.JWT_ACCESS_EXPIRES),
  });

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    // expiresIn: ENV.JWT_REFRESH_EXPIRES as SignOptions["expiresIn"],
    expiresIn: Number(ENV.JWT_REFRESH_EXPIRES),
  });

// -------- verify -----

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayload;
