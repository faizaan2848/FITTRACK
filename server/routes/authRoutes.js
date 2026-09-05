import { Router } from "express";
import { register, login, refresh, logout, getMe, patchMe } from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../middleware/validators/authValidators.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, patchMe);

export default router;
