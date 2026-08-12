import prisma from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export async function registerUser(data) {
  const existing = await prisma.usuario.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existing) {
    const error = new Error("El email ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      telefono: data.telefono || null,
      rol: "CLIENTE",
    },
  });

  const token = generateToken({ id: user.id, rol: user.rol });

  return {
    token,
    user: publicUser(user),
  };
}

export async function loginUser(data) {
  const user = await prisma.usuario.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  if (!user.activo) {
    const error = new Error("Usuario desactivado");
    error.statusCode = 403;
    throw error;
  }

  const validPassword = await comparePassword(data.password, user.password);

  if (!validPassword) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, rol: user.rol });

  return {
    token,
    user: publicUser(user),
  };
}

export function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}