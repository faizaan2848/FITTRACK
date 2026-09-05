import { asyncHandler } from "../utils/asyncHandler.js";
import { getAnalytics } from "../services/analyticsService.js";

const VALID_RANGES = ["week", "month", "year"];

export const getMyAnalytics = asyncHandler(async (req, res) => {
  const range = VALID_RANGES.includes(req.query.range) ? req.query.range : "week";
  const analytics = await getAnalytics(req.user.sub, range);
  res.status(200).json(analytics);
});
