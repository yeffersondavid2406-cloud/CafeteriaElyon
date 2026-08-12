import { Router } from "express";
import {
  getAllInventory,
  getInventory,
  updateExistingInventory,
  getLowStock,
} from "../controllers/inventoryController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { productIdParamSchema } from "../validators/orderValidator.js";
import { z } from "zod";

const router = Router();

const inventorySchema = z.object({
  cantidad: z.number().int().nonnegative().optional(),
  stockMinimo: z.number().int().nonnegative().optional(),
});

router.use(authenticate);
router.use(requireRole("ADMIN", "EMPLEADO"));

router.get("/", getAllInventory);
router.get("/low-stock", getLowStock);
router.get("/:productId", validate(productIdParamSchema, "params"), getInventory);
router.put(
  "/:productId",
  validate(productIdParamSchema, "params"),
  validate(inventorySchema),
  updateExistingInventory
);

export default router;