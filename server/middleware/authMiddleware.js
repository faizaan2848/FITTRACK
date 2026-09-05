// Protects a route: requires a valid `Authorization: Bearer <token>` header.
// On success, attaches the decoded payload to req.user for downstream
// controllers to read (req.user.sub is the user's id).

import { verifyAccessToken } from "../utils/tokenUtils.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});
