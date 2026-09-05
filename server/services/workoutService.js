import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { notifyUser } from "./notificationService.js";

const workoutInclude = {
  exercises: {
    include: { exercise: true },
    orderBy: { order: "asc" },
  },
};

export async function listWorkouts(userId) {
  return prisma.workout.findMany({
    where: { userId },
    include: workoutInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkout(userId, workoutId) {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: workoutInclude,
  });

  if (!workout || workout.userId !== userId) {
    throw new ApiError(404, "Workout not found");
  }

  return workout;
}

// exercises: [{ exerciseId, sets, reps, weight, restSeconds, notes }]
export async function createWorkout(userId, { name, description, isTemplate, exercises }) {
  return prisma.workout.create({
    data: {
      userId,
      name,
      description,
      isTemplate: Boolean(isTemplate),
      exercises: {
        create: (exercises || []).map((ex, index) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? null,
          restSeconds: ex.restSeconds ?? null,
          notes: ex.notes ?? null,
          order: index,
        })),
      },
    },
    include: workoutInclude,
  });
}

export async function updateWorkout(userId, workoutId, { name, description, exercises }) {
  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing || existing.userId !== userId) {
    throw new ApiError(404, "Workout not found");
  }

  // Simplest correct approach for replacing a workout's exercise list:
  // delete the old set and recreate it, rather than diffing - this app's
  // workouts are small (a handful of exercises), so the extra writes cost
  // nothing and the logic stays easy to follow.
  if (exercises) {
    await prisma.workoutExercise.deleteMany({ where: { workoutId } });
  }

  return prisma.workout.update({
    where: { id: workoutId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(exercises && {
        exercises: {
          create: exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight ?? null,
            restSeconds: ex.restSeconds ?? null,
            notes: ex.notes ?? null,
            order: index,
          })),
        },
      }),
    },
    include: workoutInclude,
  });
}

export async function deleteWorkout(userId, workoutId) {
  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing || existing.userId !== userId) {
    throw new ApiError(404, "Workout not found");
  }

  await prisma.workout.delete({ where: { id: workoutId } });
}

export async function logCompletedWorkout(userId, { workoutId, durationMinutes, caloriesBurned, notes }) {
  if (workoutId) {
    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout || workout.userId !== userId) {
      throw new ApiError(404, "Workout not found");
    }
  }

  const log = await prisma.workoutLog.create({
    data: {
      userId,
      workoutId: workoutId ?? null,
      durationMinutes: durationMinutes ?? null,
      caloriesBurned: caloriesBurned ?? null,
      notes: notes ?? null,
    },
    include: { workout: true },
  });

  const workoutName = log.workout?.name || "your workout";
  await notifyUser(userId, "WORKOUT_REMINDER", `Nice work — you logged "${workoutName}". Keep the streak going! 💪`);

  return log;
}

export async function listWorkoutHistory(userId, { limit = 30 } = {}) {
  return prisma.workoutLog.findMany({
    where: { userId },
    include: { workout: true },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
}
