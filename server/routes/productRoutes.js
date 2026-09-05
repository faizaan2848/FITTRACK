import { Router } from "express";
import { getProducts, getProductById, postProduct } from "../controllers/productController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getProducts);
router.post("/", postProduct);
router.get("/:id", getProductById);

export default router;
