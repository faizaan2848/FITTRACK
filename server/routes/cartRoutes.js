import { Router } from "express";
import { getMyCart, postCartItem, putCartItem, deleteCartItem } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyCart);
router.post("/", postCartItem);
router.put("/:id", putCartItem);
router.delete("/:id", deleteCartItem);

export default router;
