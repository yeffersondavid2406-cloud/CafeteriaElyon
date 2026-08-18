import express from "express";
import pool from "../config/database.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREAR PEDIDO
| POST /api/pedidos
|--------------------------------------------------------------------------
|
| Body esperado:
{
  "cliente_id": 1,
  "mesa": 3,
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 4,
      "cantidad": 1
    }
  ]
}
|
*/

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { cliente_id, mesa, productos } = req.body;

    // Validar productos
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El pedido debe tener al menos un producto",
      });
    }

    await client.query("BEGIN");

    let total = 0;
    const detalles = [];

    // -------------------------------------------------------
    // Buscar productos y calcular total
    // -------------------------------------------------------
    for (const item of productos) {
      const productoId = Number(item.producto_id);
      const cantidad = Number(item.cantidad);

      if (!productoId || !cantidad || cantidad <= 0) {
        throw new Error("Producto o cantidad inválida");
      }

      const productoResult = await client.query(
        `
        SELECT id, nombre, precio
        FROM productos
        WHERE id = $1
          AND disponible = TRUE
        `,
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

      detalles.push({
        producto_id: producto.id,
        cantidad,
        precio,
      });
    }

    // -------------------------------------------------------
    // Crear pedido
    // -------------------------------------------------------
    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos
      (cliente_id, mesa, total, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        cliente_id || null,
        mesa || null,
        total,
        "pendiente",
      ]
    );

    const pedido = pedidoResult.rows[0];

    // -------------------------------------------------------
    // Crear detalles del pedido
    // -------------------------------------------------------
    for (const detalle of detalles) {
      await client.query(
        `
        INSERT INTO detalles_pedidos
        (pedido_id, producto_id, cantidad, precio)
        VALUES ($1, $2, $3, $4)
        `,
        [
          pedido.id,
          detalle.producto_id,
          detalle.cantidad,
          detalle.precio,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Pedido creado correctamente",
      pedido,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Error creando pedido:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error creando pedido",
    });
  } finally {
    client.release();
  }
});

/*
|--------------------------------------------------------------------------
| OBTENER TODOS LOS PEDIDOS
| GET /api/pedidos
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.cliente_id,
        p.mesa,
        p.total,
        p.estado,
        p.fecha,

        -- DETALLES DEL PEDIDO
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

        -- INFORMACIÓN DEL PAGO
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

      LEFT JOIN detalles_pedidos dp
        ON dp.pedido_id = p.id

      GROUP BY
        p.id,
        p.cliente_id,
        p.mesa,
        p.total,
        p.estado,
        p.fecha

      ORDER BY p.fecha DESC;
    `);

    res.json({
      success: true,
      pedidos: result.rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pedidos:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo pedidos",
    });
  }
});

/*
|--------------------------------------------------------------------------
| OBTENER UN PEDIDO
| GET /api/pedidos/:id
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.cliente_id,
        p.mesa,
        p.total,
        p.estado,
        p.fecha,

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
        ) AS detalles

      FROM pedidos p

      LEFT JOIN detalles_pedidos dp
        ON dp.pedido_id = p.id

      WHERE p.id = $1

      GROUP BY
        p.id,
        p.cliente_id,
        p.mesa,
        p.total,
        p.estado,
        p.fecha;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    res.json({
      success: true,
      pedido: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo pedido:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo pedido",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ACTUALIZAR ESTADO
| PATCH /api/pedidos/:id/estado
|--------------------------------------------------------------------------
*/

router.patch("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    console.log("📦 Estado recibido:", estado);
console.log("📦 Body recibido:", req.body);

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
      `
      UPDATE pedidos
      SET estado = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Estado actualizado correctamente",
      pedido: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando pedido:", error);

    res.status(500).json({
      success: false,
      message: "Error actualizando pedido",
    });
  }
});

export default router;