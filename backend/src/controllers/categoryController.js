import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getAllCategories(req, res) {
  try {
    const categories = await listCategories();
    return successResponse(res, "Categorías obtenidas correctamente", categories);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getCategory(req, res) {
  try {
    const category = await getCategoryById(req.params.id);
    return successResponse(res, "Categoría obtenida correctamente", category);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function createNewCategory(req, res) {
  try {
    const category = await createCategory(req.body);
    return successResponse(res, "Categoría creada correctamente", category, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function updateExistingCategory(req, res) {
  try {
    const category = await updateCategory(req.params.id, req.body);
    return successResponse(res, "Categoría actualizada correctamente", category);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function deleteExistingCategory(req, res) {
  try {
    await deleteCategory(req.params.id);
    return successResponse(res, "Categoría eliminada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}