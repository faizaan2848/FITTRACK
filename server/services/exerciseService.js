import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function listExercises({ category, userId }) {
  const exercises = await prisma.exercise.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
  });

  if (!userId) return exercises.map((e) => ({ ...e, isFavorite: false }));

  const favorites = await prisma.favoriteExercise.findMany({ where: { userId } });
  const favoriteIds = new Set(favorites.map((f) => f.exerciseId));

  return exercises.map((e) => ({ ...e, isFavorite: favoriteIds.has(e.id) }));
}

export async function toggleFavorite({ userId, exerciseId }) {
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    throw new ApiError(404, "Exercise not found");
  }

  const existing = await prisma.favoriteExercise.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
  });

  if (existing) {
    await prisma.favoriteExercise.delete({ where: { id: existing.id } });
    return { isFavorite: false };
  }

  await prisma.favoriteExercise.create({ data: { userId, exerciseId } });
  return { isFavorite: true };
}
