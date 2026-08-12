import { Router } from "express";
import { getUsers, updateUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { idParamSchema } from "../validators/orderValidator.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/", getUsers);
router.put("/:id", validate(idParamSchema, "params"), updateUser);

export default router;