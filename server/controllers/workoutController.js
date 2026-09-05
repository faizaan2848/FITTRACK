import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  logCompletedWorkout,
  listWorkoutHistory,
} from "../services/workoutService.js";

export const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await listWorkouts(req.user.sub);
  res.status(200).json({ workouts });
});

export const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await getWorkout(req.user.sub, req.params.id);
  res.status(200).json({ workout });
});

export const postWorkout = asyncHandler(async (req, res) => {
  const workout = await createWorkout(req.user.sub, req.body);
  res.status(201).json({ workout });
});

export const putWorkout = asyncHandler(async (req, res) => {
  const workout = await updateWorkout(req.user.sub, req.params.id, req.body);
  res.status(200).json({ workout });
});

export const removeWorkout = asyncHandler(async (req, res) => {
  await deleteWorkout(req.user.sub, req.params.id);
  res.status(204).send();
});

export const postWorkoutLog = asyncHandler(async (req, res) => {
  const log = await logCompletedWorkout(req.user.sub, req.body);
  res.status(201).json({ log });
});

export const getWorkoutHistory = asyncHandler(async (req, res) => {
  const logs = await listWorkoutHistory(req.user.sub);
  res.status(200).json({ logs });
});
