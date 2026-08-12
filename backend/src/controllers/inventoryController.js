import {
  listInventory,
  getInventoryByProduct,
  updateInventory,
  getLowStockProducts,
} from "../services/inventoryService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getAllInventory(req, res) {
  try {
    const inventory = await listInventory();
    return successResponse(res, "Inventario obtenido correctamente", inventory);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getInventory(req, res) {
  try {
    const inventory = await getInventoryByProduct(req.params.productId);
    return successResponse(res, "Inventario obtenido correctamente", inventory);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function updateExistingInventory(req, res) {
  try {
    const inventory = await updateInventory(req.params.productId, req.body);
    return successResponse(res, "Inventario actualizado correctamente", inventory);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getLowStock(req, res) {
  try {
    const inventory = await getLowStockProducts();
    return successResponse(res, "Productos con stock bajo obtenidos correctamente", inventory);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}