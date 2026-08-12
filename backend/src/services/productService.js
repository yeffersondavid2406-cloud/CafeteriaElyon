import prisma from "../config/database.js";

export async function listProducts({ q, categoriaId, destacado, disponible } = {}) {
  const where = {};

  if (q) {
    where.nombre = { contains: q };
  }

  if (categoriaId) {
    where.categoriaId = Number(categoriaId);
  }

  if (destacado !== undefined) {
    where.destacado = destacado === true || destacado === "true";
  }

  if (disponible !== undefined) {
    where.disponible = disponible === true || disponible === "true";
  }

  return prisma.producto.findMany({
    where,
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id) {
  const product = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { categoria: true },
  });

  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return product;
}

export async function createProduct(data) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: data.categoriaId },
  });

  if (!categoria) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const product = await prisma.producto.create({
    data,
    include: { categoria: true },
  });

  await prisma.inventario.create({
    data: {
      productoId: product.id,
      cantidad: data.stock ?? 0,
      stockMinimo: 5,
    },
  });

  return product;
}

export async function updateProduct(id, data) {
  const existing = await prisma.producto.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (data.categoriaId) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: data.categoriaId },
    });

    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }

  const product = await prisma.producto.update({
    where: { id: Number(id) },
    data,
    include: { categoria: true },
  });

  if (data.stock !== undefined) {
    await prisma.inventario.upsert({
      where: { productoId: product.id },
      create: {
        productoId: product.id,
        cantidad: data.stock,
        stockMinimo: 5,
      },
      update: {
        cantidad: data.stock,
      },
    });
  }

  return product;
}

export async function deleteProduct(id) {
  const existing = await prisma.producto.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await prisma.producto.delete({
    where: { id: Number(id) },
  });

  return true;
}

export async function getFeaturedProducts() {
  return prisma.producto.findMany({
    where: { destacado: true, disponible: true },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  });
}