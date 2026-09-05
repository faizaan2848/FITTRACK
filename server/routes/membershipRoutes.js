import { Router } from "express";
import { getMyMembership, postUpgrade } from "../controllers/membershipController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyMembership);
router.post("/upgrade", postUpgrade);

export default router;
