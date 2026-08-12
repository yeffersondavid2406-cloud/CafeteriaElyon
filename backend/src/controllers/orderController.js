import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderService.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function createNewOrder(req, res) {
  try {
    const order = await createOrder(req.user, req.body);
    return successResponse(res, "Pedido creado correctamente", order, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getAllOrders(req, res) {
  try {
    const { estado } = req.query;
    const orders = await listOrders({
      userId: req.user.id,
      rol: req.user.rol,
      estado,
    });
    return successResponse(res, "Pedidos obtenidos correctamente", orders);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getOrder(req, res) {
  try {
    const order = await getOrderById(req.params.id, req.user);
    return successResponse(res, "Pedido obtenido correctamente", order);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await listOrders({
      userId: req.user.id,
      rol: req.user.rol,
    });
    return successResponse(res, "Mis pedidos obtenidos correctamente", orders);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function changeOrderStatus(req, res) {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.estado);
    return successResponse(res, "Estado del pedido actualizado correctamente", order);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

export async function removeOrder(req, res) {
  try {
    await deleteOrder(req.params.id);
    return successResponse(res, "Pedido eliminado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}