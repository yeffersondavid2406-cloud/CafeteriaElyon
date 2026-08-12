import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorMiddleware(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
      errors: err.errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Ya existe un registro con esos datos",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Error en la base de datos",
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos para la base de datos",
    });
  }

  if (err.message === "Token inválido" || err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
}