import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFoundHandler, errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API de Cafetería Elyon funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;