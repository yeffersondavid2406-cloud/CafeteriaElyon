import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// ==========================================
// OBTENER TODOS LOS PRODUCTOS
// GET /api/productos
// ==========================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        precio,
        categoria,
        imagen,
        descripcion,
        destacado,
        disponible
      FROM productos
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      productos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo productos",
    });
  }
});

// ==========================================
// OBTENER UN PRODUCTO
// GET /api/productos/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        precio,
        categoria,
        imagen,
        descripcion,
        destacado,
        disponible
      FROM productos
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo producto:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo producto",
    });
  }
});

// ==========================================
// CREAR PRODUCTO
// POST /api/productos
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      precio,
      categoria,
      imagen,
      descripcion,
      destacado,
      disponible,
    } = req.body;

    if (!nombre || precio === undefined || !categoria) {
      return res.status(400).json({
        success: false,
        message: "nombre, precio y categoria son obligatorios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO productos
      (
        nombre,
        precio,
        categoria,
        imagen,
        descripcion,
        destacado,
        disponible
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        nombre,
        precio,
        categoria,
        imagen || null,
        descripcion || null,
        destacado ?? false,
        disponible ?? true,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando producto:", error);

    res.status(500).json({
      success: false,
      message: "Error creando producto",
    });
  }
});

// ==========================================
// ACTUALIZAR PRODUCTO
// PUT /api/productos/:id
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      precio,
      categoria,
      imagen,
      descripcion,
      destacado,
      disponible,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE productos
      SET
        nombre = $1,
        precio = $2,
        categoria = $3,
        imagen = $4,
        descripcion = $5,
        destacado = $6,
        disponible = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        nombre,
        precio,
        categoria,
        imagen || null,
        descripcion || null,
        destacado ?? false,
        disponible ?? true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);

    res.status(500).json({
      success: false,
      message: "Error actualizando producto",
    });
  }
});

// ==========================================
// ELIMINAR PRODUCTO
// DELETE /api/productos/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM productos
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);

    res.status(500).json({
      success: false,
      message: "Error eliminando producto",
    });
  }
});

export default router;