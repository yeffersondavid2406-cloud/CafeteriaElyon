import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { env } from "../config/env.js";

export const USER_SELECT = `
  id,
  nombre,
  nombre_usuario,
  correo,
  rol,
  proveedor_auth,
  created_at AS fecha_creacion
`;

// =====================================================
// requireAuth: usuario autenticado (token JWT válido)
// =====================================================

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No autorizado: token requerido",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtSecret);

    const result = await pool.query(
      `SELECT ${USER_SELECT} FROM usuarios WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    console.error("❌ Token inválido:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}

// =====================================================
// requireAdmin: usuario autenticado con rol administrador
// =====================================================

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado: se requiere rol administrador",
    });
  }

  next();
}

// Alias para compatibilidad con la arquitectura anterior
export const authenticate = requireAuth;