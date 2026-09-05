import { Router } from "express";
import { getMyAchievements } from "../controllers/achievementController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyAchievements);

export default router;
