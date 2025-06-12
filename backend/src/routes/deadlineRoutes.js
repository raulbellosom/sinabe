import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDeadlinesByProjectId,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  assignInventoryToDeadline,
  unassignInventoryFromDeadline,
  getInventoriesByDeadline,
} from "../controllers/deadlineController.js";

import {
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from "../controllers/deadlineTaskController.js";

const router = express.Router();

// 🔄 Deadlines de un proyecto
router
  .route("/projects/:projectId")
  .get(protect, getDeadlinesByProjectId)
  .post(protect, createDeadline);

// 📝 Actualizar y eliminar deadline
router
  .route("/:id")
  .put(protect, updateDeadline)
  .delete(protect, deleteDeadline);

// 📦 Asignar y desasignar inventarios
router.route("/:deadlineId/assign").post(protect, assignInventoryToDeadline);

router
  .route("/:deadlineId/unassign/:inventoryId")
  .delete(protect, unassignInventoryFromDeadline);

// 🔍 Obtener inventarios asignados
router.route("/:deadlineId/inventories").get(protect, getInventoriesByDeadline);

// Tareas
router.post("/:deadlineId/task", createTask);
router.put("/task/:id", updateTask);
router.delete("/task/:id", deleteTask);
router.post("/task/reorder", reorderTasks);

export default router;
