import { Router } from "express";
import { getMyWishlist, toggleWishlistItem } from "../controllers/wishlistController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyWishlist);
router.post("/:productId/toggle", toggleWishlistItem);

export default router;
