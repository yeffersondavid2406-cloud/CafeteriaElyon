import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from "../services/productService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getAllProducts(req, res) {
  try {
    const { q, categoriaId, destacado, disponible } = req.query;
    const products = await listProducts({ q, categoriaId, destacado, disponible });
    return successResponse(res, "Productos obtenidos correctamente", products);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);
    return successResponse(res, "Producto obtenido correctamente", product);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function createNewProduct(req, res) {
  try {
    const product = await createProduct(req.body);
    return successResponse(res, "Producto creado correctamente", product, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function updateExistingProduct(req, res) {
  try {
    const product = await updateProduct(req.params.id, req.body);
    return successResponse(res, "Producto actualizado correctamente", product);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function deleteExistingProduct(req, res) {
  try {
    await deleteProduct(req.params.id);
    return successResponse(res, "Producto eliminado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getFeatured(req, res) {
  try {
    const products = await getFeaturedProducts();
    return successResponse(res, "Productos destacados obtenidos correctamente", products);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}