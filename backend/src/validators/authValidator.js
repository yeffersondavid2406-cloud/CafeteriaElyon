import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  telefono: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});