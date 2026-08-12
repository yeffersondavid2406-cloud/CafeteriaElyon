import express from "express";
import pool from "./config/database.js";

const app = express();

app.use(express.json());

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