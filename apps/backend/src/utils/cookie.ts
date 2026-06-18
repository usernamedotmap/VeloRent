import { CookieOptions, Response } from "express";
import { ENV } from "../config/env";

// const BASE_OPTIONS = {
//   httpOnly: false,
//   secure: ENV.IS_PROD,
//   sameSite: ENV.IS_PROD ? "none" : "lax" ,
//   path: "/",
// };

export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: "none" as const ,
  path: "/",
  partitioned: true,
});

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  const options = getCookieOptions();
  const accessSeconds = Number(ENV.JWT_ACCESS_EXPIRES);
  const refreshSeconds = Number(ENV.JWT_REFRESH_EXPIRES);

  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: accessSeconds * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: refreshSeconds * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  const options = getCookieOptions();
  res.clearCookie("accessToken", {
    ...options,
  });
  res.clearCookie("refreshToken", {
    ...options,
  });
};