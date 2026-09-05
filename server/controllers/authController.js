import { asyncHandler } from "../utils/asyncHandler.js";
import {
  registerUser,
  loginUser,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  updateProfile,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../services/authService.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await registerUser({ name, email, password });
  const { accessToken, refreshToken } = await issueTokenPair(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.status(201).json({ user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });
  const { accessToken, refreshToken } = await issueTokenPair(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.status(200).json({ user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!incomingToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  const { user, accessToken, refreshToken } = await rotateRefreshToken(incomingToken);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.status(200).json({ user, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await revokeRefreshToken(incomingToken);

  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.status(200).json({ message: "Logged out" });
});

// GET /api/auth/me - relies on requireAuth having set req.user
export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      gender: true,
      height: true,
      weight: true,
      goal: true,
      plan: true,
      paymentQrUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({ user });
});

export const patchMe = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.sub, req.body);
  res.status(200).json({ user });
});
