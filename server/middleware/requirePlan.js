import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PLAN_ORDER } from "../utils/planLimits.js";

// Usage: router.post("/analyze", requireAuth, requirePlan("PRO"), handler)
// Passing "PRO" means PRO or anything ranked above it in PLAN_ORDER also passes.
export function requirePlan(minimumPlan) {
  return asyncHandler(async (req, res, next) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { plan: true },
    });

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    const userRank = PLAN_ORDER.indexOf(user.plan);
    const requiredRank = PLAN_ORDER.indexOf(minimumPlan);

    if (userRank < requiredRank) {
      throw new ApiError(
        403,
        `This feature requires the ${minimumPlan} plan or higher. Upgrade to unlock it.`
      );
    }

    req.userPlan = user.plan;
    next();
  });
}
