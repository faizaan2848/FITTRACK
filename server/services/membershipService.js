import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { PLAN_LIMITS, PLAN_ORDER } from "../utils/planLimits.js";

export async function getMembership(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const listingCount = await prisma.product.count({ where: { createdByUserId: userId } });

  return {
    plan: user.plan,
    limits: PLAN_LIMITS[user.plan],
    usage: { listingCount },
    allPlans: PLAN_ORDER.map((key) => ({ key, ...PLAN_LIMITS[key] })),
  };
}

// SIMULATED UPGRADE - no real payment gateway is wired in yet. This just
// sets the plan directly. When real payments are added later, this is
// the ONLY function that changes: it'll be called from a webhook/success
// callback after a real charge succeeds, instead of being called directly
// from a button click. Every gate elsewhere (requirePlan middleware,
// listing limits) stays exactly the same either way.
export async function upgradePlan(userId, newPlan) {
  if (!PLAN_ORDER.includes(newPlan)) {
    throw new ApiError(422, "Invalid plan");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan: newPlan },
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      height: true, weight: true, goal: true, plan: true, createdAt: true,
    },
  });

  return user;
}
