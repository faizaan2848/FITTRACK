import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboardSummary } from "../services/dashboardService.js";

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary(req.user.sub);
  res.status(200).json(summary);
});
