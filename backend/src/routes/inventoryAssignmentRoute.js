import express from "express";
import {
  assignInventoryToDeadline,
  getInventoryAssignmentsByDeadline,
  unassignInventoryFromDeadline,
} from "../controllers/inventoryAssignmentController.js";

const router = express.Router();

// Asignar un inventario a una deadline
router.post("/assign", assignInventoryToDeadline);

// Obtener inventarios asignados a una deadline
router.get("/deadline/:deadlineId", getInventoryAssignmentsByDeadline);

// Desasignar un inventario
router.put("/unassign/:assignmentId", unassignInventoryFromDeadline);

export default router;
