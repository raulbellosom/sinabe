import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateExcelReport,
  generateWordReport,
} from "../controllers/reportController.js";

const router = Router();

router.post("/excel", protect, generateExcelReport);
router.post("/word", protect, generateWordReport);

export default router;
