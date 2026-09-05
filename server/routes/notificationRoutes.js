import { Router } from "express";
import { getMyNotifications, patchRead, patchReadAll } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyNotifications);
router.patch("/:id/read", patchRead);
router.patch("/read-all", patchReadAll);

export default router;
