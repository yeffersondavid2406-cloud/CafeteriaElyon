import { Router } from "express";
import {
  getActivePromotions,
  getAllPromotionsHandler,
  getPromotion,
  createNewPromotion,
  updateExistingPromotion,
  deleteExistingPromotion,
} from "../controllers/promotionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { z } from "zod";
import { idParamSchema } from "../validators/orderValidator.js";

const router = Router();

const promotionSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  descuento: z.number().positive("El descuento debe ser mayor que 0"),
  fechaInicio: z.coerce.date("Fecha de inicio inválida"),
  fechaFin: z.coerce.date("Fecha de fin inválida"),
  activo: z.boolean().default(true),
});

const promotionUpdateSchema = promotionSchema.partial();

router.get("/", getActivePromotions);
router.get("/all", getAllPromotionsHandler);
router.get("/:id", validate(idParamSchema, "params"), getPromotion);

router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(promotionSchema),
  createNewPromotion
);
router.put(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(promotionUpdateSchema),
  updateExistingPromotion
);
router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  deleteExistingPromotion
);

export default router;