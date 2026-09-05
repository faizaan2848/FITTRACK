import { Router } from "express";
import { postMeasurement, getMeasurements } from "../controllers/bodyMeasurementController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMeasurements);
router.post("/", postMeasurement);

export default router;
