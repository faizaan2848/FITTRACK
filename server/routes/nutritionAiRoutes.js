import { Router } from "express";
import multer from "multer";
import { postAnalyzeMeal } from "../controllers/nutritionAiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePlan } from "../middleware/requirePlan.js";

// Keep the file in memory (not written to disk) since we immediately
// forward it to Python and never need to store it ourselves. 8MB cap
// is generous for a phone photo while still blocking abuse.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);
router.use(requirePlan("PRO"));

router.post("/analyze", upload.single("file"), postAnalyzeMeal);

export default router;
