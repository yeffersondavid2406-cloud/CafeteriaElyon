import { Router } from "express";
import {
  createNewOrder,
  getAllOrders,
  getOrder,
  getMyOrders,
  changeOrderStatus,
  removeOrder,
} from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  orderSchema,
  orderStatusSchema,
  idParamSchema,
} from "../validators/orderValidator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(orderSchema), createNewOrder);
router.get("/", getAllOrders);
router.get("/my-orders", getMyOrders);
router.get("/:id", validate(idParamSchema, "params"), getOrder);

router.put(
  "/:id/status",
  requireRole("ADMIN", "EMPLEADO"),
  validate(idParamSchema, "params"),
  validate(orderStatusSchema),
  changeOrderStatus
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  removeOrder
);

export default router;