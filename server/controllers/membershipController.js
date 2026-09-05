import { asyncHandler } from "../utils/asyncHandler.js";
import { getMembership, upgradePlan } from "../services/membershipService.js";

export const getMyMembership = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.user.sub);
  res.status(200).json(membership);
});

export const postUpgrade = asyncHandler(async (req, res) => {
  const user = await upgradePlan(req.user.sub, req.body.plan);
  res.status(200).json({ user });
});
