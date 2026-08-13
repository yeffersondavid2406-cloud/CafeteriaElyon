import express from "express";
import cors from "cors";

import pool from "./config/database.js";
import productosRoutes from "./routes/productos.js";
import pedidosRoutes from "./routes/pedidos.js";
import pagosRoutes from "./routes/pagos.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pagos", pagosRoutes);
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Conexión con Supabase funcionando",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);

    res.status(500).json({
      success: false,
      message: "Error conectando con Supabase",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});