import { Router } from "express";
import {
  getWorkouts,
  getWorkoutById,
  postWorkout,
  putWorkout,
  removeWorkout,
  postWorkoutLog,
  getWorkoutHistory,
} from "../controllers/workoutController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getWorkouts);
router.post("/", postWorkout);
router.get("/history", getWorkoutHistory);
router.get("/:id", getWorkoutById);
router.put("/:id", putWorkout);
router.delete("/:id", removeWorkout);
router.post("/:id/logs", (req, res, next) => {
  req.body.workoutId = req.params.id;
  next();
}, postWorkoutLog);
router.post("/logs/quick", postWorkoutLog); // log a session with no workoutId (freeform)

export default router;
