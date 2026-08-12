import prisma from "../config/database.js";

export async function listInventory() {
  return prisma.inventario.findMany({
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          precio: true,
          stock: true,
          disponible: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getInventoryByProduct(productId) {
  const inventory = await prisma.inventario.findUnique({
    where: { productoId: Number(productId) },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          precio: true,
          stock: true,
          disponible: true,
        },
      },
    },
  });

  if (!inventory) {
    const error = new Error("Inventario del producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return inventory;
}

export async function updateInventory(productId, data) {
  const product = await prisma.producto.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    if (data.cantidad !== undefined) {
      if (data.cantidad < 0) {
        const error = new Error("La cantidad no puede ser negativa");
        error.statusCode = 400;
        throw error;
      }

      await tx.producto.update({
        where: { id: Number(productId) },
        data: { stock: data.cantidad },
      });
    }

    return tx.inventario.upsert({
      where: { productoId: Number(productId) },
      create: {
        productoId: Number(productId),
        cantidad: data.cantidad ?? 0,
        stockMinimo: data.stockMinimo ?? 5,
      },
      update: {
        cantidad: data.cantidad,
        stockMinimo: data.stockMinimo,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            stock: true,
            disponible: true,
          },
        },
      },
    });
  });
}

export async function getLowStockProducts() {
  const inventories = await prisma.inventario.findMany({
    where: {
      cantidad: {
        lte: prisma.inventario.fields.stockMinimo,
      },
    },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          precio: true,
          stock: true,
          disponible: true,
        },
      },
    },
    orderBy: { cantidad: "asc" },
  });

  return inventories.map((inv) => ({
    ...inv,
    esStockBajo: true,
  }));
}