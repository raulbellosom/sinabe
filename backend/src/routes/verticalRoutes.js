import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  getVerticals,
  createVertical,
  updateVertical,
  deleteVertical,
  assignVerticalsToModel,
  getModelVerticals,
  removeVerticalFromModel,
} from "../controllers/verticalController.js";

const router = express.Router();

router.get("/", protect, checkPermission("view_verticals"), getVerticals);
router.post("/", protect, checkPermission("create_verticals"), createVertical);
router.put("/:id", protect, checkPermission("edit_verticals"), updateVertical);
router.delete(
  "/:id",
  protect,
  checkPermission("delete_verticals"),
  deleteVertical,
);

router.get(
  "/model/:modelId",
  protect,
  checkPermission("view_verticals"),
  getModelVerticals,
);
router.post(
  "/model/:modelId",
  protect,
  checkPermission("edit_verticals"),
  assignVerticalsToModel,
);
router.delete(
  "/model/:modelId/:verticalId",
  protect,
  checkPermission("edit_verticals"),
  removeVerticalFromModel,
);

export default router;
