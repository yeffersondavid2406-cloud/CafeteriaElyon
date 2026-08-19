import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  actualizarPerfil,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, actualizarPerfil);

export default router;