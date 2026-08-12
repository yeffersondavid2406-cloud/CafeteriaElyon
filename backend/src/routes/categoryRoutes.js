import { Router } from "express";
import {
  getAllCategories,
  getCategory,
  createNewCategory,
  updateExistingCategory,
  deleteExistingCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { categorySchema, categoryUpdateSchema } from "../validators/categoryValidator.js";
import { idParamSchema } from "../validators/orderValidator.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", validate(idParamSchema, "params"), getCategory);

router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(categorySchema),
  createNewCategory
);
router.put(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(categoryUpdateSchema),
  updateExistingCategory
);
router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  deleteExistingCategory
);

export default router;