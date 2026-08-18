import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// =====================================================
// CREAR PAGO
// POST /api/pagos
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { pedido_id, metodo } = req.body;

    if (!pedido_id || !metodo) {
      return res.status(400).json({
        success: false,
        message: "pedido_id y metodo son obligatorios",
      });
    }

    const metodosPermitidos = [
      "efectivo",
      "transferencia",
    ];

    if (!metodosPermitidos.includes(metodo)) {
      return res.status(400).json({
        success: false,
        message: "Método de pago no válido",
        metodosPermitidos,
      });
    }

    // Verificar que el pedido exista
    const pedidoResult = await pool.query(
      `SELECT id
       FROM pedidos
       WHERE id = $1`,
      [pedido_id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "El pedido no existe",
      });
    }

    // Crear pago
    const result = await pool.query(
      `INSERT INTO pagos
       (pedido_id, metodo, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        pedido_id,
        metodo,
        "pendiente",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Pago registrado correctamente",
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando pago:", error);

    res.status(500).json({
      success: false,
      message: "Error registrando el pago",
    });
  }
});

// =====================================================
// OBTENER TODOS LOS PAGOS
// GET /api/pagos
// =====================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.pedido_id,
        p.metodo,
        p.estado,
        p.fecha
      FROM pagos p
      ORDER BY p.fecha DESC
    `);

    res.json({
      success: true,
      pagos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pagos:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo pagos",
    });
  }
});

// =====================================================
// OBTENER UN PAGO
// GET /api/pagos/:id
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        pedido_id,
        metodo,
        estado,
        fecha
      FROM pagos
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    res.json({
      success: true,
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo pago:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo pago",
    });
  }
});

// =====================================================
// ACTUALIZAR ESTADO DEL PAGO
// PATCH /api/pagos/:id/estado
// =====================================================
router.patch("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    console.log("📦 Estado recibido:", estado);
console.log("📦 Body recibido:", req.body);

    const estadosPermitidos = [
      "pendiente",
      "pagado",
      "rechazado",
      "cancelado",
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado de pago no válido",
        estadosPermitidos,
      });
    }

    const result = await pool.query(
      `
      UPDATE pagos
      SET estado = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Estado del pago actualizado",
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando pago:", error);

    res.status(500).json({
      success: false,
      message: "Error actualizando pago",
    });
  }
});

export default router;