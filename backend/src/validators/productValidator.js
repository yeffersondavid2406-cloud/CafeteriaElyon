import { z } from "zod";

export const productSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  precio: z
    .number()
    .positive("El precio debe ser mayor que 0"),
  imagen: z.string().optional(),
  categoriaId: z
    .number()
    .int()
    .positive("Categoría inválida"),
  stock: z
    .number()
    .int()
    .nonnegative("El stock no puede ser negativo")
    .default(0),
  destacado: z.boolean().default(false),
  disponible: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();