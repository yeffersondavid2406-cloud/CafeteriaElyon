import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { pedido_id, metodo } = req.body;

    if (!pedido_id || !metodo) {
      return res.status(400).json({
        success: false,
        message: "pedido_id y metodo son obligatorios",
      });
    }

    const result = await pool.query(
      `INSERT INTO pagos
       (pedido_id, metodo, estado)
       VALUES ($1, $2, 'pendiente')
       RETURNING *`,
      [pedido_id, metodo]
    );

    res.status(201).json({
      success: true,
      pago: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error registrando pago:", error);

    res.status(500).json({
      success: false,
      message: "Error registrando pago",
    });
  }
});

export default router;