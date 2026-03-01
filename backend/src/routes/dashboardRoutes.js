import { Router } from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = Router();

router.get("/", protect, checkPermission("view_dashboard"), getDashboardData);

export default router;
