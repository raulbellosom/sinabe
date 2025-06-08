import express from "express";
import { protect } from "../middleware/authMiddleware.js";

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

router.get("/search", protect, searchProjects);

router.route("/").get(protect, getProjects).post(protect, createProject);

router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.get("/:id/summary", protect, getProjectSummary);

export default router;
