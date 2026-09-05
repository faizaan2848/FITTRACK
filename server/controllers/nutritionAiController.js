import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeMealPhoto } from "../services/nutritionAiService.js";
import { ApiError } from "../utils/ApiError.js";

export const postAnalyzeMeal = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }

  const result = await analyzeMealPhoto({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
  });

  res.status(200).json(result);
});
