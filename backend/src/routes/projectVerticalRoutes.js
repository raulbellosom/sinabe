import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVerticals,
  createVertical,
  deleteVertical,
  updateVertical,
} from "../controllers/projectVerticalController.js";

const router = express.Router();

router.route("").get(protect, getVerticals).post(protect, createVertical);
router
  .route("/:id")
  .delete(protect, deleteVertical)
  .put(protect, updateVertical);

export default router;
