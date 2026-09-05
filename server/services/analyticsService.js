import { prisma } from "../config/prisma.js";

// Builds the list of time buckets to aggregate over. Week/month use daily
// buckets; year uses monthly buckets - otherwise a year of daily points
// would be unreadable on a chart and slow to query for no benefit.
function buildPeriods(range) {
  const periods = [];

  if (range === "year") {
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      periods.push({
        from,
        to,
        label: from.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      });
    }
    return periods;
  }

  const days = range === "month" ? 30 : 7;
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const from = new Date(day);
    from.setHours(0, 0, 0, 0);
    const to = new Date(day);
    to.setHours(23, 59, 59, 999);
    periods.push({
      from,
      to,
      label: from.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }
  return periods;
}

function daysBetween(from, to) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export async function getAnalytics(userId, range = "week") {
  const periods = buildPeriods(range);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { height: true } });
  const heightM = user?.height ? user.height / 100 : null;

  const series = await Promise.all(
    periods.map(async ({ from, to, label }) => {
      const [measurement, mealAgg, workoutCount, completedHabits] = await Promise.all([
        prisma.bodyMeasurement.findFirst({
          where: { userId, recordedAt: { gte: from, lte: to } },
          orderBy: { recordedAt: "desc" },
        }),
        prisma.mealLog.aggregate({
          where: { userId, loggedAt: { gte: from, lte: to } },
          _sum: { calories: true, protein: true },
        }),
        prisma.workoutLog.count({
          where: { userId, completedAt: { gte: from, lte: to } },
        }),
        prisma.habitEntry.count({
          where: { userId, habitType: "WORKOUT", date: { gte: from, lte: to }, completed: true },
        }),
      ]);

      const weight = measurement?.weight ?? null;
      const bmi = weight && heightM ? Number((weight / (heightM * heightM)).toFixed(1)) : null;
      const totalDaysInPeriod = daysBetween(from, to);

      return {
        label,
        weight,
        bodyFatPct: measurement?.bodyFatPct ?? null,
        bmi,
        caloriesConsumed: Math.round(mealAgg._sum.calories || 0),
        proteinIntake: Math.round(mealAgg._sum.protein || 0),
        workoutFrequency: workoutCount,
        exerciseCompletionPct: Math.round((completedHabits / totalDaysInPeriod) * 100),
      };
    })
  );

  return { range, series };
}
