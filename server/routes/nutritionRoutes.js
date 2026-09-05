import { Router } from "express";
import { getDay, postMeal, removeMeal, postWater, removeWater } from "../controllers/nutritionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/day", getDay); // ?date=YYYY-MM-DD, defaults to today
router.post("/meals", postMeal);
router.delete("/meals/:id", removeMeal);
router.post("/water", postWater);
router.delete("/water/:id", removeWater);

export default router;
