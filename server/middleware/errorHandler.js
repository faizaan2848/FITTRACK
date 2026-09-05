// Centralized error handler. Controllers call next(err) (or throw inside
// an async wrapper - see utils/asyncHandler.js, added in Phase 2) and this
// formats every error response the same way instead of each controller
// building its own res.status(...).json(...) shape.

import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Only log unexpected (5xx) errors loudly. Expected 4xx outcomes -
  // like "no refresh token yet" on first visit, or bad login credentials -
  // are normal application flow, not bugs, so they shouldn't clutter logs.
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: err.message || "Internal server error",
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
