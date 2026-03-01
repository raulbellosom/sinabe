import express from "express";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from "../controllers/roleController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_roles"), getRoles)
  .post(protect, checkPermission("create_roles"), createRole);
router
  .route("/:id")
  .get(protect, checkPermission("view_roles"), getRoleById)
  .put(protect, checkPermission("edit_roles"), updateRole)
  .delete(protect, checkPermission("delete_roles"), deleteRole);

export default router;
