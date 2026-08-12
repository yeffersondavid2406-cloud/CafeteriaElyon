import {
  listPromotions,
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../services/promotionService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getActivePromotions(req, res) {
  try {
    const promotions = await listPromotions();
    return successResponse(res, "Promociones obtenidas correctamente", promotions);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getAllPromotionsHandler(req, res) {
  try {
    const promotions = await getAllPromotions();
    return successResponse(res, "Promociones obtenidas correctamente", promotions);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getPromotion(req, res) {
  try {
    const promotion = await getPromotionById(req.params.id);
    return successResponse(res, "Promoción obtenida correctamente", promotion);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function createNewPromotion(req, res) {
  try {
    const promotion = await createPromotion(req.body);
    return successResponse(res, "Promoción creada correctamente", promotion, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function updateExistingPromotion(req, res) {
  try {
    const promotion = await updatePromotion(req.params.id, req.body);
    return successResponse(res, "Promoción actualizada correctamente", promotion);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function deleteExistingPromotion(req, res) {
  try {
    await deletePromotion(req.params.id);
    return successResponse(res, "Promoción eliminada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}