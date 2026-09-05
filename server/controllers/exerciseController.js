import { asyncHandler } from "../utils/asyncHandler.js";
import { listExercises, toggleFavorite } from "../services/exerciseService.js";

export const getExercises = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const exercises = await listExercises({ category, userId: req.user?.sub });
  res.status(200).json({ exercises });
});

export const favoriteExercise = asyncHandler(async (req, res) => {
  const result = await toggleFavorite({ userId: req.user.sub, exerciseId: req.params.id });
  res.status(200).json(result);
});
