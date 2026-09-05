import { prisma } from "../config/prisma.js";

// Each achievement is just: "count something, compare to a threshold."
// No new table needed - everything it checks already exists from
// earlier phases (workout logs, meals, measurements, orders).
const DEFINITIONS = [
  {
    key: "first_workout",
    title: "First Steps",
    description: "Log your first workout",
    icon: "🏋️",
    target: 1,
    metric: "workoutCount",
  },
  {
    key: "fifty_workouts",
    title: "Half Century",
    description: "Log 50 workouts",
    icon: "💪",
    target: 50,
    metric: "workoutCount",
  },
  {
    key: "week_streak",
    title: "Consistency Streak",
    description: "Complete a 7-day workout streak",
    icon: "🔥",
    target: 7,
    metric: "currentStreak",
  },
  {
    key: "nutrition_novice",
    title: "Nutrition Novice",
    description: "Log 10 meals",
    icon: "🍽️",
    target: 10,
    metric: "mealCount",
  },
  {
    key: "hydration_habit",
    title: "Hydration Habit",
    description: "Log water intake 10 times",
    icon: "💧",
    target: 10,
    metric: "waterCount",
  },
  {
    key: "scale_watcher",
    title: "Scale Watcher",
    description: "Log 5 body measurements",
    icon: "📏",
    target: 5,
    metric: "measurementCount",
  },
  {
    key: "first_order",
    title: "Shopper",
    description: "Place your first marketplace order",
    icon: "🛍️",
    target: 1,
    metric: "orderCount",
  },
];

// Counts consecutive days (ending today or yesterday) with a completed
// WORKOUT habit entry. Ending "yesterday" still counts as an active
// streak - it just means today isn't logged yet.
async function getCurrentStreak(userId) {
  const entries = await prisma.habitEntry.findMany({
    where: { userId, habitType: "WORKOUT", completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (entries.length === 0) return 0;

  const dates = new Set(entries.map((e) => e.date.toISOString().slice(0, 10)));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today isn't logged yet, start counting from yesterday instead -
  // otherwise a streak would reset to 0 every morning before you log in.
  if (!dates.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function getAchievements(userId) {
  const [workoutCount, mealCount, waterCount, measurementCount, orderCount, currentStreak] =
    await Promise.all([
      prisma.workoutLog.count({ where: { userId } }),
      prisma.mealLog.count({ where: { userId } }),
      prisma.waterEntry.count({ where: { userId } }),
      prisma.bodyMeasurement.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      getCurrentStreak(userId),
    ]);

  const metrics = { workoutCount, mealCount, waterCount, measurementCount, orderCount, currentStreak };

  return DEFINITIONS.map((def) => {
    const progress = metrics[def.metric];
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      target: def.target,
      progress: Math.min(progress, def.target),
      isUnlocked: progress >= def.target,
    };
  });
}
