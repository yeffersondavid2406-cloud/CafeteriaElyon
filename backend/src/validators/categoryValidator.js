import { z } from "zod";

export const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();