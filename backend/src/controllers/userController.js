import prisma from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getUsers(req, res) {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, "Usuarios obtenidos correctamente", users);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const { password, ...data } = req.body;

    const user = await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(res, "Usuario actualizado correctamente", user);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}