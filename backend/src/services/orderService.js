import prisma from "../config/database.js";

const ORDER_INCLUDE = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
  detalles: {
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          imagen: true,
        },
      },
    },
  },
};

export async function createOrder(user, data) {
  if (!data.productos || data.productos.length === 0) {
    const error = new Error("Debe incluir al menos un producto");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const detalleData = [];

    for (const item of data.productos) {
      const product = await tx.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!product) {
        throw new Error(`Producto con id ${item.productoId} no encontrado`);
      }

      if (!product.disponible) {
        throw new Error(`El producto "${product.nombre}" no está disponible`);
      }

      if (product.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}`
        );
      }

      const itemSubtotal = Number(product.precio) * item.cantidad;
      subtotal += itemSubtotal;

      detalleData.push({
        productoId: product.id,
        cantidad: item.cantidad,
        precio: product.precio,
        subtotal: itemSubtotal,
      });
    }

    const total = subtotal;

    const order = await tx.pedido.create({
      data: {
        usuarioId: user.id,
        mesa: data.mesa || null,
        subtotal,
        descuento: 0,
        total,
        metodoPago: data.metodoPago,
        estado: "PENDIENTE",
        detalles: {
          create: detalleData,
        },
      },
      include: {
        detalles: true,
      },
    });

    for (const item of detalleData) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: {
          stock: {
            decrement: item.cantidad,
          },
        },
      });

      await tx.inventario.upsert({
        where: { productoId: item.productoId },
        create: {
          productoId: item.productoId,
          cantidad: Math.max(0, item.cantidad),
          stockMinimo: 5,
        },
        update: {
          cantidad: {
            decrement: item.cantidad,
          },
        },
      });
    }

    return tx.pedido.findUnique({
      where: { id: order.id },
      include: ORDER_INCLUDE,
    });
  });
}

export async function listOrders({ userId, rol, estado } = {}) {
  const where = {};

  if (userId && rol !== "ADMIN") {
    where.usuarioId = userId;
  }

  if (estado) {
    where.estado = estado;
  }

  return prisma.pedido.findMany({
    where,
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id, user) {
  const order = await prisma.pedido.findUnique({
    where: { id: Number(id) },
    include: ORDER_INCLUDE,
  });

  if (!order) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (user.rol !== "ADMIN" && order.usuarioId !== user.id) {
    const error = new Error("No tienes permisos para ver este pedido");
    error.statusCode = 403;
    throw error;
  }

  return order;
}

export async function updateOrderStatus(id, estado) {
  const order = await prisma.pedido.findUnique({
    where: { id: Number(id) },
  });

  if (!order) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return prisma.pedido.update({
    where: { id: Number(id) },
    data: { estado },
    include: ORDER_INCLUDE,
  });
}

export async function deleteOrder(id) {
  const order = await prisma.pedido.findUnique({
    where: { id: Number(id) },
  });

  if (!order) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return prisma.pedido.delete({
    where: { id: Number(id) },
  });
}