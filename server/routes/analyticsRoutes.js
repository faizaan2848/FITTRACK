import { Router } from "express";
import { getMyAnalytics } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePlan } from "../middleware/requirePlan.js";

const router = Router();

router.use(requireAuth);
router.use(requirePlan("PRO"));

router.get("/", getMyAnalytics); // ?range=week|month|year

export default router;
