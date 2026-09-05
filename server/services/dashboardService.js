// All the read/aggregation queries the dashboard needs, in one place.
// Kept deliberately simple (a loop over the last 7 days rather than a
// single groupBy) so it stays easy to read and modify as new metrics
// get added in later phases - this app's data volume never justifies
// the extra complexity of hand-rolled SQL aggregation here.

import { prisma } from "../config/prisma.js";

const DAILY_CALORIE_GOAL = 2200;
const DAILY_WATER_GOAL_ML = 2500;
const DAILY_STEP_GOAL = 10000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(startOfDay(d));
  }
  return days;
}

async function getTodaySnapshot(userId) {
  const today = new Date();
  const from = startOfDay(today);
  const to = endOfDay(today);

  const [meals, water, steps, latestWorkoutLog, latestMeasurement, user] = await Promise.all([
    prisma.mealLog.findMany({ where: { userId, loggedAt: { gte: from, lte: to } } }),
    prisma.waterEntry.aggregate({
      where: { userId, loggedAt: { gte: from, lte: to } },
      _sum: { amountMl: true },
    }),
    prisma.stepEntry.findUnique({ where: { userId_date: { userId, date: from } } }),
    prisma.workoutLog.findFirst({
      where: { userId, completedAt: { gte: from, lte: to } },
      include: { workout: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { height: true, weight: true } }),
  ]);

  const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
  const nutritionSummary = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const weight = latestMeasurement?.weight ?? user?.weight ?? null;
  const height = user?.height ?? null;
  const bmi = weight && height ? Number((weight / (height / 100) ** 2).toFixed(1)) : null;

  return {
    calories: { consumed: Math.round(caloriesConsumed), goal: DAILY_CALORIE_GOAL },
    water: { ml: water._sum.amountMl || 0, goalMl: DAILY_WATER_GOAL_ML },
    steps: { count: steps?.steps || 0, goal: DAILY_STEP_GOAL },
    workout: latestWorkoutLog
      ? {
          name: latestWorkoutLog.workout?.name || "Workout",
          durationMinutes: latestWorkoutLog.durationMinutes,
          caloriesBurned: latestWorkoutLog.caloriesBurned,
        }
      : null,
    weight,
    bmi,
    bodyFatPct: latestMeasurement?.bodyFatPct ?? null,
    nutritionSummary: {
      protein: Math.round(nutritionSummary.protein),
      carbs: Math.round(nutritionSummary.carbs),
      fat: Math.round(nutritionSummary.fat),
      fiber: Math.round(nutritionSummary.fiber),
    },
  };
}

async function getWeeklySeries(userId) {
  const days = lastNDays(7);

  const series = await Promise.all(
    days.map(async (day) => {
      const from = startOfDay(day);
      const to = endOfDay(day);

      const [caloriesBurnedAgg, caloriesConsumedAgg, measurement, workoutHabit] = await Promise.all([
        prisma.workoutLog.aggregate({
          where: { userId, completedAt: { gte: from, lte: to } },
          _sum: { caloriesBurned: true },
        }),
        prisma.mealLog.aggregate({
          where: { userId, loggedAt: { gte: from, lte: to } },
          _sum: { calories: true },
        }),
        prisma.bodyMeasurement.findFirst({
          where: { userId, recordedAt: { gte: from, lte: to } },
          orderBy: { recordedAt: "desc" },
        }),
        prisma.habitEntry.findUnique({
          where: {
            userId_habitType_date: { userId, habitType: "WORKOUT", date: from },
          },
        }),
      ]);

      return {
        date: from.toISOString().slice(0, 10),
        caloriesBurned: caloriesBurnedAgg._sum.caloriesBurned || 0,
        caloriesConsumed: Math.round(caloriesConsumedAgg._sum.calories || 0),
        weight: measurement?.weight ?? null,
        exerciseCompleted: Boolean(workoutHabit?.completed),
      };
    })
  );

  const completedDays = series.filter((d) => d.exerciseCompleted).length;

  return {
    days: series,
    exerciseCompletionPct: Math.round((completedDays / series.length) * 100),
  };
}

export async function getDashboardSummary(userId) {
  const [today, weekly] = await Promise.all([
    getTodaySnapshot(userId),
    getWeeklySeries(userId),
  ]);

  return { today, weekly };
}
