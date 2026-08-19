import express from "express";
import pool from "../config/database.js";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

const LISTADO_PEDIDOS = `
  SELECT
    p.id,
    p.usuario_id,
    p.cliente_id,
    p.mesa,
    p.total,
    p.estado,
    p.fecha,

    u.nombre_usuario AS usuario_usuario,
    u.nombre AS usuario_nombre,
    u.correo AS usuario_email,

    COALESCE(
      json_agg(
        json_build_object(
          'id', dp.id,
          'producto_id', dp.producto_id,
          'cantidad', dp.cantidad,
          'precio', dp.precio
        )
      ) FILTER (WHERE dp.id IS NOT NULL),
      '[]'::json
    ) AS detalles,

    (
      SELECT json_build_object(
        'id', pg.id,
        'metodo', pg.metodo,
        'estado', pg.estado,
        'fecha', pg.fecha
      )
      FROM pagos pg
      WHERE pg.pedido_id = p.id
      ORDER BY pg.id DESC
      LIMIT 1
    ) AS pago

  FROM pedidos p

  LEFT JOIN usuarios u
    ON u.id = p.usuario_id

  LEFT JOIN detalles_pedidos dp
    ON dp.pedido_id = p.id
`;

// =====================================================
// CREAR PEDIDO
// POST /api/pedidos   (requiere autenticación)
// Body: { mesa, productos: [{ producto_id, cantidad }] }
// =====================================================

router.post("/", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { mesa, productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El pedido debe tener al menos un producto",
      });
    }

    await client.query("BEGIN");

    let total = 0;
    const detalles = [];

    for (const item of productos) {
      const productoId = Number(item.producto_id);
      const cantidad = Number(item.cantidad);

      if (!productoId || !cantidad || cantidad <= 0) {
        throw new Error("Producto o cantidad inválida");
      }

      const productoResult = await client.query(
        `SELECT id, nombre, precio
         FROM productos
         WHERE id = $1 AND disponible = TRUE`,
        [productoId]
      );

      if (productoResult.rows.length === 0) {
        throw new Error(
          `El producto con ID ${productoId} no existe o no está disponible`
        );
      }

      const producto = productoResult.rows[0];
      const precio = Number(producto.precio);

      total += precio * cantidad;

      detalles.push({ producto_id: producto.id, cantidad, precio });
    }

    // El usuario autenticado queda asociado al pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos
         (usuario_id, cliente_id, mesa, total, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, null, mesa || null, total, "pendiente"]
    );

    const pedido = pedidoResult.rows[0];

    for (const detalle of detalles) {
      await client.query(
        `INSERT INTO detalles_pedidos
           (pedido_id, producto_id, cantidad, precio)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, detalle.producto_id, detalle.cantidad, detalle.precio]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Pedido creado correctamente",
      pedido: {
        ...pedido,
        usuario_usuario: req.user.nombre_usuario,
        usuario_nombre: req.user.nombre,
        usuario_email: req.user.correo,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creando pedido:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creando pedido",
    });
  } finally {
    client.release();
  }
});

// =====================================================
// MIS PEDIDOS (cliente autenticado)
// GET /api/pedidos/mis-pedidos
// =====================================================

router.get("/mis-pedidos", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `${LISTADO_PEDIDOS}
       WHERE p.usuario_id = $1
       GROUP BY p.id, p.usuario_id, p.cliente_id, p.mesa, p.total, p.estado,
                p.fecha, u.nombre_usuario, u.nombre, u.correo
       ORDER BY p.fecha DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      pedidos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo mis pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo tus pedidos",
    });
  }
});

// =====================================================
// OBTENER TODOS LOS PEDIDOS (solo administrador)
// GET /api/pedidos
// =====================================================

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `${LISTADO_PEDIDOS}
       GROUP BY p.id, p.usuario_id, p.cliente_id, p.mesa, p.total, p.estado,
                p.fecha, u.nombre_usuario, u.nombre, u.correo
       ORDER BY p.fecha DESC`
    );

    return res.json({
      success: true,
      pedidos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo pedidos",
    });
  }
});

// =====================================================
// OBTENER UN PEDIDO
// GET /api/pedidos/:id  (admin: cualquier pedido, cliente: solo el suyo)
// =====================================================

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `${LISTADO_PEDIDOS}
       WHERE p.id = $1
       GROUP BY p.id, p.usuario_id, p.cliente_id, p.mesa, p.total, p.estado,
                p.fecha, u.nombre_usuario, u.nombre, u.correo`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    const pedido = result.rows[0];

    if (req.user.rol !== "admin" && Number(pedido.usuario_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver este pedido",
      });
    }

    return res.json({
      success: true,
      pedido,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo pedido",
    });
  }
});

// =====================================================
// ACTUALIZAR ESTADO (solo administrador)
// PATCH /api/pedidos/:id/estado
// =====================================================

router.patch("/:id/estado", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      "pendiente",
      "preparando",
      "listo",
      "entregado",
      "cancelado",
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido",
        estadosPermitidos,
      });
    }

    const result = await pool.query(
      `UPDATE pedidos
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Estado actualizado correctamente",
      pedido: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error actualizando pedido",
    });
  }
});

export default router;