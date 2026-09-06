// Business logic for authentication. Controllers stay thin and just
// handle req/res; this file is where the actual rules live, and it's
// what Phase 12's tests would target directly.

import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/tokenUtils.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches default JWT_REFRESH_EXPIRES_IN

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return toPublicUser(user);
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return toPublicUser(user);
}

// Issues a fresh access + refresh token pair for a user, and persists the
// hashed refresh token so it can be looked up/revoked on refresh or logout.
export async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
}

// Validates an incoming refresh token, rotates it (revokes the old one,
// issues a new pair) so a stolen refresh token has a limited window of use.
export async function rotateRefreshToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken
    .updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => {
      // Token already gone/invalid - logout should still succeed silently.
    });
}

export const REFRESH_COOKIE_NAME = "refreshToken";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: REFRESH_TOKEN_TTL_MS,
  path: "/api/auth",
};

const UPDATABLE_FIELDS = ["name", "age", "gender", "height", "weight", "goal", "paymentQrUrl"];

export async function updateProfile(userId, updates) {
  const data = {};
  for (const field of UPDATABLE_FIELDS) {
    if (updates[field] !== undefined) data[field] = updates[field];
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      height: true, weight: true, goal: true, plan: true, paymentQrUrl: true, createdAt: true,
    },
  });

  return user;
}
