import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

// --- Access token ---
// Short-lived, sent in the response body, kept in memory on the client
// and attached as a Bearer header (see client/src/services/api.js).

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// --- Refresh token ---
// Long-lived, sent only in an httpOnly cookie. We store a hash of it
// (not the raw token) in the RefreshToken table, the same way passwords
// are hashed, so a leaked database can't be used to impersonate sessions.

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
