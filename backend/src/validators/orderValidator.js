import { z } from "zod";

export const orderItemSchema = z.object({
  productoId: z
    .number()
    .int()
    .positive("Producto inválido"),
  cantidad: z
    .number()
    .int()
    .positive("La cantidad debe ser mayor que 0"),
});

export const orderSchema = z.object({
  mesa: z
    .number()
    .int()
    .positive("Mesa inválida")
    .optional(),
  metodoPago: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"]),
  productos: z
    .array(orderItemSchema)
    .min(1, "Debe incluir al menos un producto"),
});

export const orderStatusSchema = z.object({
  estado: z.enum([
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREPARACION",
    "LISTO",
    "ENTREGADO",
    "CANCELADO",
  ]),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID inválido"),
});

export const productIdParamSchema = z.object({
  productId: z.string().regex(/^\d+$/, "ID inválido"),
});