import { Response } from "express";
import { ENV } from "../config/env";

const BASE_OPTIONS = {
  httpOnly: false,
  secure: ENV.IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  const accessSeconds = Number(ENV.JWT_ACCESS_EXPIRES);
  const refreshSeconds = Number(ENV.JWT_REFRESH_EXPIRES);

  res.cookie("accessToken", accessToken, {
    ...BASE_OPTIONS,
    maxAge: accessSeconds * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...BASE_OPTIONS,
    maxAge: refreshSeconds * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", {
    ...BASE_OPTIONS,
  });
  res.clearCookie("refreshToken", {
    ...BASE_OPTIONS,
  });
};
