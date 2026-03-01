import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  createCustodyRecord,
  getCustodyRecord,
  getCustodyRecords,
  deleteCustodyRecord,
  getCustodyRecordByToken,
  updateCustodyRecord,
  resendCustodyEmail,
  getPublicLink,
  submitPublicSignature,
} from "../controllers/custodyController.js";

const router = express.Router();

// Public endpoints — no auth required
router.get("/public/:token", getCustodyRecordByToken);
router.post("/public/:token/signature", submitPublicSignature);

// Protected endpoints
router.get("/", protect, checkPermission("view_custodies"), getCustodyRecords);
router.post(
  "/",
  protect,
  checkPermission("create_custodies"),
  createCustodyRecord,
);
router.get(
  "/:id",
  protect,
  checkPermission("view_custodies"),
  getCustodyRecord,
);
router.put(
  "/:id",
  protect,
  checkPermission("edit_custodies"),
  updateCustodyRecord,
);
router.delete(
  "/:id",
  protect,
  checkPermission("delete_custodies"),
  deleteCustodyRecord,
);
router.post(
  "/:id/resend-email",
  protect,
  checkPermission("edit_custodies"),
  resendCustodyEmail,
);
router.get(
  "/:id/public-link",
  protect,
  checkPermission("view_custodies"),
  getPublicLink,
);

export default router;
