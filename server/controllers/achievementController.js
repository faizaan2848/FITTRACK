import { asyncHandler } from "../utils/asyncHandler.js";
import { getAchievements } from "../services/achievementService.js";

export const getMyAchievements = asyncHandler(async (req, res) => {
  const achievements = await getAchievements(req.user.sub);
  res.status(200).json({ achievements });
});
