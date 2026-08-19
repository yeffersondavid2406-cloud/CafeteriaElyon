import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Todas las rutas de /api/admin requieren sesión + rol admin
router.use(requireAuth, requireAdmin);

// =====================================================
// DASHBOARD
// GET /api/admin/dashboard
// =====================================================
router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalPedidos,
      pendientes,
      preparando,
      listos,
      entregados,
      cancelados,
      ventas,
      totalClientes,
      totalProductos,
      pagosPendientes,
    ] = await Promise.all([
      pool.query(`SELECT count(*)::int AS n FROM pedidos`),
      pool.query(`SELECT count(*)::int AS n FROM pedidos WHERE estado = 'pendiente'`),
      pool.query(`SELECT count(*)::int AS n FROM pedidos WHERE estado = 'preparando'`),
      pool.query(`SELECT count(*)::int AS n FROM pedidos WHERE estado = 'listo'`),
      pool.query(`SELECT count(*)::int AS n FROM pedidos WHERE estado = 'entregado'`),
      pool.query(`SELECT count(*)::int AS n FROM pedidos WHERE estado = 'cancelado'`),
      pool.query(`SELECT COALESCE(SUM(total), 0) AS n FROM pedidos`),
      pool.query(`SELECT count(*)::int AS n FROM usuarios WHERE rol = 'cliente'`),
      pool.query(`SELECT count(*)::int AS n FROM productos`),
      pool.query(`SELECT count(*)::int AS n FROM pagos WHERE estado = 'pendiente'`),
    ]);

    return res.json({
      success: true,
      dashboard: {
        totalPedidos: totalPedidos.rows[0].n,
        pendientes: pendientes.rows[0].n,
        preparando: preparando.rows[0].n,
        listos: listos.rows[0].n,
        entregados: entregados.rows[0].n,
        cancelados: cancelados.rows[0].n,
        ventas: ventas.rows[0].n,
        totalClientes: totalClientes.rows[0].n,
        totalProductos: totalProductos.rows[0].n,
        pagosPendientes: pagosPendientes.rows[0].n,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo el dashboard",
    });
  }
});

// =====================================================
// LISTAR CLIENTES
// GET /api/admin/clientes
// =====================================================
router.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         nombre,
         nombre_usuario,
         correo AS email,
         rol,
         created_at AS fecha_creacion
       FROM usuarios
       WHERE rol = 'cliente'
       ORDER BY id DESC`
    );

    return res.json({
      success: true,
      clientes: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo clientes:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo clientes",
    });
  }
});

export default router;