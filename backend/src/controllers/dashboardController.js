import { getSummary, getSalesStats, getTopProducts } from "../services/dashboardService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function summary(req, res) {
  try {
    const data = await getSummary();
    return successResponse(res, "Resumen del dashboard obtenido correctamente", data);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function sales(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await getSalesStats({ desde, hasta });
    return successResponse(res, "Estadísticas de ventas obtenidas correctamente", data);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function topProducts(req, res) {
  try {
    const data = await getTopProducts();
    return successResponse(res, "Productos más vendidos obtenidos correctamente", data);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}