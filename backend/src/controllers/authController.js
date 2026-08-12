import { registerUser, loginUser } from "../services/authService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function register(req, res) {
  try {
    const result = await registerUser(req.body);
    return successResponse(res, "Usuario registrado correctamente", result, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body);
    return successResponse(res, "Inicio de sesión exitoso", result);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function me(req, res) {
  try {
    const { password, ...user } = req.user;
    return successResponse(res, "Usuario obtenido correctamente", user);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}