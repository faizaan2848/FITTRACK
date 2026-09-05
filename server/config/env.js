// Single source of truth for environment variables.
// Every other file imports `env` from here instead of touching
// process.env directly, so config is validated in one place.

import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  DATABASE_URL: process.env.DATABASE_URL || "",

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Phase 9: base URL of the existing Python AI nutrition service.
  // Express calls this; the React client never talks to Python directly.
  PYTHON_AI_SERVICE_URL: process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000",
};
