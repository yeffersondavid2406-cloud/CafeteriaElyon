import { Router } from "express";
import {
  summary,
  sales,
  topProducts,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/summary", summary);
router.get("/sales", sales);
router.get("/top-products", topProducts);

export default router;