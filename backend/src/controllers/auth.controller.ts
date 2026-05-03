import { asyncHandler } from "../utils/asyncHandler";
import * as AuthService from "../services/auth.service";
import { HttpStatus } from "../utils/httpStatus";
import { clearAuthCookies, setAuthCookies } from "../utils/cookie";
import { generateDeviceId } from "../utils/deviceFingerprint";

export const registerController = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);

  res.status(HttpStatus.CREATED).json({
    success: true,
    data: user,
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.socket.remoteAddress || undefined;
  const userAgent = req.get("user-agent") || undefined;
  const deviceId = generateDeviceId(req);
  
  const { user, token } = await AuthService.login(req.body, deviceId, ipAddress, userAgent);

  setAuthCookies(res, token.accessToken, token.refreshToken);

  res.status(HttpStatus.OK).json({
    success: true,
    data: user,
  });
});

export const refreshController = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken as string | undefined;

  if (!oldRefreshToken) {
    res.status(401).json({
      success: false,
      error: {
        code: "NO_REFRESH_TOKEN",
        message: "No refresh token provided",
      },
    });
    return;
  }

  const ipAddress = req.ip || req.socket.remoteAddress || undefined;
  const userAgent = req.get("user-agent") || undefined;
  const deviceId = generateDeviceId(req);

  const tokens = await AuthService.refresh(oldRefreshToken, deviceId, ipAddress, userAgent);

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "Tokens refreshed successfully",
    },
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  if (req.user?.userId) {
    const deviceId = generateDeviceId(req);
    await AuthService.logout(req.user.userId, deviceId);
  }

  clearAuthCookies(res);

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
  });
});

export const getMeController = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user!.userId);

  res.status(HttpStatus.OK).json({
    success: true,
    data: user,
  });
});
