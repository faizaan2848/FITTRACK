import { Router } from "express";
import {
  postCheckout,
  getMyOrders,
  getMySales,
  postMarkPaid,
  postConfirmReceived,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyOrders);
router.get("/sales", getMySales);
router.post("/checkout", postCheckout);
router.post("/items/:itemId/mark-paid", postMarkPaid);
router.post("/items/:itemId/confirm-received", postConfirmReceived);

export default router;
