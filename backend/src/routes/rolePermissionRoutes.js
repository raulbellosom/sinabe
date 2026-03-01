import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  addPermissionToRole,
  removePermissionFromRole,
  getRolePermissionByRoleId,
  getRolePermissions,
} from "../controllers/rolePermissionController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_roles"), getRolePermissions);

router
  .route("/role/:roleId")
  .get(protect, checkPermission("view_roles"), getRolePermissionByRoleId);
router
  .route("/add")
  .post(protect, checkPermission("edit_roles"), addPermissionToRole);
router
  .route("/remove")
  .post(protect, checkPermission("edit_roles"), removePermissionFromRole);

export default router;
