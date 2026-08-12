import prisma from "../config/database.js";

export async function listPromotions() {
  const now = new Date();

  return prisma.promocion.findMany({
    where: { activo: true, fechaFin: { gte: now } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPromotions() {
  return prisma.promocion.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromotionById(id) {
  const promotion = await prisma.promocion.findUnique({
    where: { id: Number(id) },
  });

  if (!promotion) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return promotion;
}

export async function createPromotion(data) {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);

  if (fin <= inicio) {
    const error = new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    error.statusCode = 400;
    throw error;
  }

  if (data.descuento <= 0 || data.descuento > 100) {
    const error = new Error("El descuento debe estar entre 1 y 100");
    error.statusCode = 400;
    throw error;
  }

  return prisma.promocion.create({ data });
}

export async function updatePromotion(id, data) {
  const existing = await prisma.promocion.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (data.fechaInicio || data.fechaFin) {
    const inicio = new Date(data.fechaInicio || existing.fechaInicio);
    const fin = new Date(data.fechaFin || existing.fechaFin);

    if (fin <= inicio) {
      const error = new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      error.statusCode = 400;
      throw error;
    }
  }

  if (data.descuento !== undefined && (data.descuento <= 0 || data.descuento > 100)) {
    const error = new Error("El descuento debe estar entre 1 y 100");
    error.statusCode = 400;
    throw error;
  }

  return prisma.promocion.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deletePromotion(id) {
  const existing = await prisma.promocion.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return prisma.promocion.delete({
    where: { id: Number(id) },
  });
}