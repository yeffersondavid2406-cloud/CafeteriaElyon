import dotenv from "dotenv";

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "secret_dev_cambiar",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};