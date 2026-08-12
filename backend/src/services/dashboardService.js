import prisma from "../config/database.js";

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function getSummary() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    ventasDelDia,
    ventasDelMes,
    pedidosDelDia,
    pedidosPendientes,
    productosVendidos,
    totalUsuarios,
    topProducts,
    lowStock,
  ] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: dayStart },
        NOT: { estado: "CANCELADO" },
      },
    }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart },
        NOT: { estado: "CANCELADO" },
      },
    }),
    prisma.pedido.count({
      where: { createdAt: { gte: dayStart } },
    }),
    prisma.pedido.count({
      where: { estado: "PENDIENTE" },
    }),
    prisma.detallePedido.aggregate({
      _sum: { cantidad: true },
      where: {
        pedido: {
          NOT: { estado: "CANCELADO" },
        },
      },
    }),
    prisma.usuario.count(),
    getTopProducts(),
    getLowStockCount(),
  ]);

  return {
    ventasDelDia: ventasDelDia._sum.total ?? 0,
    ventasDelMes: ventasDelMes._sum.total ?? 0,
    pedidosDelDia,
    pedidosPendientes,
    productosVendidos: productosVendidos._sum.cantidad ?? 0,
    topProducts,
    lowStock,
    totalUsuarios,
  };
}

export async function getTopProducts(limit = 5) {
  const top = await prisma.detallePedido.groupBy({
    by: ["productoId"],
    where: {
      pedido: {
        NOT: { estado: "CANCELADO" },
      },
    },
    _sum: { cantidad: true },
    orderBy: {
      _sum: { cantidad: "desc" },
    },
    take: limit,
  });

  const products = await prisma.producto.findMany({
    where: {
      id: { in: top.map((t) => t.productoId) },
    },
    select: {
      id: true,
      nombre: true,
      precio: true,
      imagen: true,
    },
  });

  return top.map((t) => {
    const product = products.find((p) => p.id === t.productoId);
    return {
      producto: product,
      totalVendido: t._sum.cantidad ?? 0,
    };
  });
}

export async function getSalesStats({ desde, hasta } = {}) {
  const where = {
    NOT: { estado: "CANCELADO" },
  };

  if (desde || hasta) {
    where.createdAt = {};
    if (desde) where.createdAt.gte = new Date(desde);
    if (hasta) where.createdAt.lte = new Date(hasta);
  }

  const orders = await prisma.pedido.findMany({
    where,
    select: {
      createdAt: true,
      total: true,
      estado: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalVentas = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const totalPedidos = orders.length;

  const porDia = orders.reduce((acc, o) => {
    const day = o.createdAt.toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + Number(o.total);
    return acc;
  }, {});

  return {
    totalVentas,
    totalPedidos,
    porDia,
    pedidos: orders,
  };
}

async function getLowStockCount() {
  const count = await prisma.inventario.count({
    where: {
      cantidad: {
        lte: prisma.inventario.fields.stockMinimo,
      },
    },
  });

  return count;
}