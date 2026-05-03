import { LoginInput, RegisterInput } from "@velorent/shared";
import {
  IUser,
  User,
  UserRole,
  RefreshTokenSession,
  MAX_SESSION_PER_USER,
} from "../models";
import { Errors } from "../utils/appError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { ENV } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Helper function to hash refresh token for storage
const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Helper function to get token expiration date
const getTokenExpirationDate = (): Date => {
  const expiresInSeconds = Number(ENV.JWT_REFRESH_EXPIRES);
  const now = new Date();
  now.setSeconds(now.getSeconds() + expiresInSeconds);
  return now;
};

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
});

export const register = async (
  input: RegisterInput,
  role: UserRole = "customer",
) => {
  const { firstName, lastName, email, phone, password } = input;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    const field = existing.email === email ? "email" : "phone";
    throw Errors.duplicate(field);
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    passwordHash: hashedPassword,
    role,
  });

  return sanitizeUser(user);
};

export const login = async (
  input: LoginInput,
  deviceId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{
  user: ReturnType<typeof sanitizeUser>;
  token: AuthTokens;
}> => {
  const { email, password } = input;
  const user = await User.findOne({
    email,
  }).select("+passwordHash");

  if (!user) throw Errors.invalidCredentials();

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw Errors.invalidCredentials();

  const userId = String(user._id);
  const payload = { userId, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token session in database (token rotation)
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getTokenExpirationDate();

  // if yung device is may session na then
  await RefreshTokenSession.findOneAndUpdate(
    { userId, deviceId },
    {
      tokenHash,
      isRevoked: false,
      expiresAt,
      lastUsedAt: new Date(),
      ipAddress,
      userAgent,
      revokedAt: null,
    },
    {
      upsert: true,
      new: true,
      setDefaultOnInsert: true,
    },
  );

  // --- enforce natin the max sessoins per user
  const sessionCount = await RefreshTokenSession.countDocuments({
    userId,
    isRevoked: false,
  });

  if (sessionCount > MAX_SESSION_PER_USER) {
    const oldest = await RefreshTokenSession.find({ userId, isRevoked: false })
      .sort({ lastUsedAt: 1 })
      .limit(sessionCount - MAX_SESSION_PER_USER)
      .select("_id");

    await RefreshTokenSession.deleteMany({
      _id: {
        $in: oldest.map((s) => s._id),
      },
    });
  }

  return { user: sanitizeUser(user), token: { accessToken, refreshToken } };
};

export const refresh = async (
  token: string,
  deviceId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<AuthTokens> => {
  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(token) as JwtPayload;
  } catch {
    throw Errors.tokenExpired();
  }

  const tokenHash = hashToken(token);
  const tokenSession = await RefreshTokenSession.findOne({
    tokenHash,
    userId: payload.userId,
    isRevoked: false,
  });

  if (!tokenSession) {
    // token not found or revoked ha?
    await RefreshTokenSession.updateMany(
      { userId: payload.userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
    throw Errors.tokenReuse();
  }

  if (new Date() > tokenSession.expiresAt) {
    await tokenSession.deleteOne();
    throw Errors.tokenExpired();
  }

  const user = await User.findById(payload.userId);
  if (!user) throw Errors.notFound("User");

  // it will not create new docuemnt hah para di maubos mag update lng
  const newAccessToken = signAccessToken({
    userId: String(user._id),
    role: user.role,
  });
  const newRefreshToken = signRefreshToken({
    userId: String(user._id),
    role: user.role,
  });

  tokenSession.tokenHash = hashToken(newRefreshToken);
  tokenSession.expiresAt = getTokenExpirationDate();
  tokenSession.lastUsedAt = new Date();
  tokenSession.ipAddress = ipAddress;
  tokenSession.userAgent = userAgent;
  await tokenSession.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (
  userId: string,
  deviceId: string,
): Promise<void> => {
  // logout pero current device lang
  await RefreshTokenSession.findOneAndDelete({ userId, deviceId });
};

// logout all devinces ha
export const logoutAll = async (userId: string): Promise<void> => {
  await RefreshTokenSession.deleteMany({ userId });
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw Errors.notFound("User");
  return sanitizeUser(user);
};
