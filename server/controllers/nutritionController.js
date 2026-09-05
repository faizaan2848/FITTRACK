import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDayNutrition,
  addMeal,
  deleteMeal,
  addWater,
  deleteWaterEntry,
} from "../services/nutritionService.js";

export const getDay = asyncHandler(async (req, res) => {
  const day = await getDayNutrition(req.user.sub, req.query.date);
  res.status(200).json(day);
});

export const postMeal = asyncHandler(async (req, res) => {
  const meal = await addMeal(req.user.sub, req.body);
  res.status(201).json({ meal });
});

export const removeMeal = asyncHandler(async (req, res) => {
  await deleteMeal(req.user.sub, req.params.id);
  res.status(204).send();
});

export const postWater = asyncHandler(async (req, res) => {
  const entry = await addWater(req.user.sub, req.body);
  res.status(201).json({ entry });
});

export const removeWater = asyncHandler(async (req, res) => {
  await deleteWaterEntry(req.user.sub, req.params.id);
  res.status(204).send();
});
