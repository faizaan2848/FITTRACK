import { Router } from "express";
import { getExercises, favoriteExercise } from "../controllers/exerciseController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getExercises);
router.post("/:id/favorite", requireAuth, favoriteExercise);

export default router;
