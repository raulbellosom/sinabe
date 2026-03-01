import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateExcelReport,
  generateWordReport,
  exportInventoriesExcel,
} from "../controllers/reportController.js";

const router = Router();

router.post("/excel", protect, generateExcelReport);
router.post("/word", protect, generateWordReport);
router.post("/export-excel", protect, exportInventoriesExcel);

export default router;
