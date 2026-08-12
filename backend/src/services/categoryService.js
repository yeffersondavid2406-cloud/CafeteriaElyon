import prisma from "../config/database.js";

export async function listCategories() {
  return prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getCategoryById(id) {
  const category = await prisma.categoria.findUnique({
    where: { id: Number(id) },
    include: {
      productos: {
        where: { disponible: true },
      },
    },
  });

  if (!category) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return category;
}

export async function createCategory(data) {
  return prisma.categoria.create({ data });
}

export async function updateCategory(id, data) {
  const existing = await prisma.categoria.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return prisma.categoria.update({
    where: { id: Number(id) },
    data,
  });
}

export async function deleteCategory(id) {
  const existing = await prisma.categoria.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return prisma.categoria.delete({
    where: { id: Number(id) },
  });
}