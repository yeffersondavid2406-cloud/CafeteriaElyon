import express from "express";
import pool from "../config/database.js";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// =====================================================
// CREAR PAGO (requiere autenticación)
// POST /api/pagos
// Body: { pedido_id, metodo }
// =====================================================
router.post("/", requireAuth, async (req, res) => {
  try {
    const { pedido_id, metodo } = req.body;

    if (!pedido_id || !metodo) {
      return res.status(400).json({
        success: false,
        message: "pedido_id y metodo son obligatorios",
      });
    }

    const metodosPermitidos = ["efectivo", "transferencia"];

    if (!metodosPermitidos.includes(metodo)) {
      return res.status(400).json({
        success: false,
        message: "Método de pago no válido",
        metodosPermitidos,
      });
    }

    // Verificar que el pedido exista y (si es cliente) le pertenezca
    const pedidoResult = await pool.query(
      `SELECT id, usuario_id FROM pedidos WHERE id = $1`,
      [pedido_id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "El pedido no existe",
      });
    }

    if (
      req.user.rol !== "admin" &&
      Number(pedidoResult.rows[0].usuario_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "No puedes registrar un pago para un pedido que no es tuyo",
      });
    }

    const result = await pool.query(
      `INSERT INTO pagos
         (pedido_id, metodo, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pedido_id, metodo, "pendiente"]
    );

    return res.status(201).json({
      success: true,
      message: "Pago registrado correctamente",
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error registrando el pago",
    });
  }
});

// =====================================================
// OBTENER TODOS LOS PAGOS (solo administrador)
// GET /api/pagos
// =====================================================
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.pedido_id, p.metodo, p.estado, p.fecha
      FROM pagos p
      ORDER BY p.fecha DESC
    `);

    return res.json({
      success: true,
      pagos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pagos:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo pagos",
    });
  }
});

// =====================================================
// OBTENER UN PAGO (admin: cualquiera, cliente: solo el suyo)
// GET /api/pagos/:id
// =====================================================
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT pg.id, pg.pedido_id, pg.metodo, pg.estado, pg.fecha,
             pe.usuario_id
      FROM pagos pg
      JOIN pedidos pe ON pe.id = pg.pedido_id
      WHERE pg.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    const pago = result.rows[0];

    if (req.user.rol !== "admin" && Number(pago.usuario_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver este pago",
      });
    }

    delete pago.usuario_id;

    return res.json({
      success: true,
      pago,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo pago",
    });
  }
});

// =====================================================
// ACTUALIZAR ESTADO DEL PAGO (solo administrador)
// PATCH /api/pagos/:id/estado
// =====================================================
router.patch("/:id/estado", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["pendiente", "pagado", "rechazado", "cancelado"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado de pago no válido",
        estadosPermitidos,
      });
    }

    const result = await pool.query(
      `UPDATE pagos
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Estado del pago actualizado",
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error actualizando pago",
    });
  }
});

export default router;