import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;