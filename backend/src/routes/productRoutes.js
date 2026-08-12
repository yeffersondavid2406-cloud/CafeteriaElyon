import { Router } from "express";
import {
  getAllProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct,
  getFeatured,
} from "../controllers/productController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { productSchema, productUpdateSchema } from "../validators/productValidator.js";
import { idParamSchema } from "../validators/orderValidator.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/featured", getFeatured);
router.get("/search", getAllProducts);
router.get("/category/:categoryId", getAllProducts);
router.get("/:id", validate(idParamSchema, "params"), getProduct);

router.post(
  "/",
  authenticate,
  requireRole("ADMIN", "EMPLEADO"),
  validate(productSchema),
  createNewProduct
);
router.put(
  "/:id",
  authenticate,
  requireRole("ADMIN", "EMPLEADO"),
  validate(idParamSchema, "params"),
  validate(productUpdateSchema),
  updateExistingProduct
);
router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  deleteExistingProduct
);

export default router;