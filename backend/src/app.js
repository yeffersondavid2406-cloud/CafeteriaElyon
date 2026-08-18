import express from "express";
import cors from "cors";

import { env } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import pedidosRoutes from "./routes/pedidos.js";
import pagosRoutes from "./routes/pagos.js";

import inventoryRoutes from "./routes/inventoryRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import {
  notFoundHandler,
  errorMiddleware,
} from "./middlewares/errorMiddleware.js";

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// =====================================================
// JSON
// =====================================================

app.use(express.json());

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API de Cafetería Elyon funcionando correctamente",
  });
});

// =====================================================
// RUTAS
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/productos", productRoutes);

app.use("/api/categories", categoryRoutes);

// PEDIDOS
app.use("/api/pedidos", pedidosRoutes);

// PAGOS
app.use("/api/pagos", pagosRoutes);

// INVENTARIO
app.use("/api/inventory", inventoryRoutes);

// PROMOCIONES
app.use("/api/promotions", promotionRoutes);

// DASHBOARD
app.use("/api/dashboard", dashboardRoutes);

// =====================================================
// 404
// =====================================================

app.use(notFoundHandler);

// =====================================================
// ERROR GLOBAL
// =====================================================

app.use(errorMiddleware);

export default app;