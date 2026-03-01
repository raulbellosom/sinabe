import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  getProjectSummary,
} from "../controllers/projectController.js";

const router = express.Router();

router.get(
  "/search",
  protect,
  checkPermission("view_projects"),
  searchProjects,
);

router
  .route("/")
  .get(protect, checkPermission("view_projects"), getProjects)
  .post(protect, checkPermission("create_projects"), createProject);

router
  .route("/:id")
  .get(protect, checkPermission("view_projects"), getProjectById)
  .put(protect, checkPermission("edit_projects"), updateProject)
  .delete(protect, checkPermission("delete_projects"), deleteProject);

router.get(
  "/:id/summary",
  protect,
  checkPermission("view_projects"),
  getProjectSummary,
);

export default router;
