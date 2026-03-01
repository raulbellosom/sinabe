import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { getAuditLogs } from "../controllers/auditLogController.js";

const router = express.Router();

router.get("/", protect, checkPermission("view_audit_logs"), getAuditLogs);

export default router;
