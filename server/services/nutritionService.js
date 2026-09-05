import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { notifyUser } from "./notificationService.js";

const DAILY_WATER_GOAL_ML = 2500; // matches the goal shown on the dashboard

function startOfDay(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDayNutrition(userId, dateStr) {
  const from = startOfDay(dateStr);
  const to = endOfDay(dateStr);

  const [meals, waterEntries] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId, loggedAt: { gte: from, lte: to } },
      orderBy: { loggedAt: "asc" },
    }),
    prisma.waterEntry.findMany({
      where: { userId, loggedAt: { gte: from, lte: to } },
      orderBy: { loggedAt: "asc" },
    }),
  ]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const waterMl = waterEntries.reduce((sum, w) => sum + w.amountMl, 0);

  const mealsByType = { BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] };
  for (const meal of meals) {
    mealsByType[meal.mealType].push(meal);
  }

  return {
    date: from.toISOString().slice(0, 10),
    mealsByType,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      fiber: Math.round(totals.fiber),
    },
    waterMl,
    waterEntries,
  };
}

export async function addMeal(userId, { mealType, name, calories, protein, carbs, fat, fiber, loggedAt }) {
  if (!["BREAKFAST", "LUNCH", "DINNER", "SNACK"].includes(mealType)) {
    throw new ApiError(422, "Invalid meal type");
  }
  if (!name || calories == null) {
    throw new ApiError(422, "Meal name and calories are required");
  }

  return prisma.mealLog.create({
    data: {
      userId,
      mealType,
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    },
  });
}

export async function deleteMeal(userId, mealId) {
  const meal = await prisma.mealLog.findUnique({ where: { id: mealId } });
  if (!meal || meal.userId !== userId) {
    throw new ApiError(404, "Meal not found");
  }
  await prisma.mealLog.delete({ where: { id: mealId } });
}

export async function addWater(userId, { amountMl, loggedAt }) {
  if (!amountMl || amountMl <= 0) {
    throw new ApiError(422, "amountMl must be a positive number");
  }

  const entryDate = loggedAt ? new Date(loggedAt) : new Date();
  const dayStart = new Date(entryDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(entryDate);
  dayEnd.setHours(23, 59, 59, 999);

  const priorTotal = await prisma.waterEntry.aggregate({
    where: { userId, loggedAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amountMl: true },
  });
  const totalBefore = priorTotal._sum.amountMl || 0;
  const totalAfter = totalBefore + Number(amountMl);

  const entry = await prisma.waterEntry.create({
    data: { userId, amountMl: Number(amountMl), loggedAt: entryDate },
  });

  // Only fire the moment the goal is first crossed today, not on every
  // glass logged afterward - checking "before < goal <= after" is what
  // makes this a one-time crossing event instead of a repeated ping.
  if (totalBefore < DAILY_WATER_GOAL_ML && totalAfter >= DAILY_WATER_GOAL_ML) {
    await notifyUser(userId, "GOAL_ACHIEVED", "You hit your water goal for today! 💧");
  }

  return entry;
}

export async function deleteWaterEntry(userId, entryId) {
  const entry = await prisma.waterEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) {
    throw new ApiError(404, "Water entry not found");
  }
  await prisma.waterEntry.delete({ where: { id: entryId } });
}
