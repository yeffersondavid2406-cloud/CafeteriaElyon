import { errorResponse } from "../utils/response.js";

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "No autorizado", 401);
    }

    if (!roles.includes(req.user.rol)) {
      return errorResponse(
        res,
        "No tienes permisos para realizar esta acción",
        403
      );
    }

    next();
  };
}