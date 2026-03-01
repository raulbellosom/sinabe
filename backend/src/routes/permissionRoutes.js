import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  createPermission,
  deletePermission,
  getPermissionById,
  getPermissions,
  updatePermission,
  syncPermissions,
} from "../controllers/permissionController.js";

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    checkPermission("view_roles", "manage_permissions"),
    getPermissions,
  )
  .post(
    protect,
    checkPermission("manage_permissions", "create_roles"),
    createPermission,
  );
router
  .route("/sync")
  .post(
    protect,
    checkPermission("manage_permissions", "edit_roles"),
    syncPermissions,
  );
router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_roles", "manage_permissions"),
    getPermissionById,
  )
  .put(
    protect,
    checkPermission("manage_permissions", "edit_roles"),
    updatePermission,
  )
  .delete(
    protect,
    checkPermission("manage_permissions", "delete_roles"),
    deletePermission,
  );

export default router;
