import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
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
  .get(protect, checkPermission("view_deadlines"), getDeadlinesByProjectId)
  .post(protect, checkPermission("create_deadlines"), createDeadline);

// 📝 Actualizar y eliminar deadline
router
  .route("/:id")
  .put(protect, checkPermission("edit_deadlines"), updateDeadline)
  .delete(protect, checkPermission("delete_deadlines"), deleteDeadline);

// 📦 Asignar y desasignar inventarios
router
  .route("/:deadlineId/assign")
  .post(protect, checkPermission("edit_deadlines"), assignInventoryToDeadline);

router
  .route("/:deadlineId/unassign/:inventoryId")
  .delete(
    protect,
    checkPermission("edit_deadlines"),
    unassignInventoryFromDeadline,
  );

// 🔍 Obtener inventarios asignados
router
  .route("/:deadlineId/inventories")
  .get(protect, checkPermission("view_deadlines"), getInventoriesByDeadline);

// Tareas
router.post(
  "/:deadlineId/task",
  protect,
  checkPermission("edit_deadlines"),
  createTask,
);
router.put("/task/:id", protect, checkPermission("edit_deadlines"), updateTask);
router.delete(
  "/task/:id",
  protect,
  checkPermission("edit_deadlines"),
  deleteTask,
);
router.post(
  "/task/reorder",
  protect,
  checkPermission("edit_deadlines"),
  reorderTasks,
);

export default router;
