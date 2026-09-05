import { Router } from "express";
import { getSummary } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);

export default router;
