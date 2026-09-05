export const PLAN_LIMITS = {
  FREE: {
    maxListings: 3,
    aiScanner: false,
    analytics: false,
  },
  PRO: {
    maxListings: 20,
    aiScanner: true,
    analytics: true,
  },
  PREMIUM: {
    maxListings: null, // null = unlimited (Infinity breaks over JSON -> becomes null anyway)
    aiScanner: true,
    analytics: true,
  },
};

export const PLAN_ORDER = ["FREE", "PRO", "PREMIUM"];

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}
