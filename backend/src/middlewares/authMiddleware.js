import { verifyToken } from "../utils/jwt.js";
import prisma from "../config/database.js";
import { errorResponse } from "../utils/response.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(
        res,
        "Token no proporcionado",
        401
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 401);
    }

    if (!user.activo) {
      return errorResponse(res, "Usuario desactivado", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Token inválido o expirado", 401);
  }
}