import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMaintenanceEvents,
  createMaintenanceEvent,
  updateMaintenanceEvent,
  deleteMaintenanceEvent,
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/", getMaintenanceEvents);
router.post("/", createMaintenanceEvent);
router.put("/:id", updateMaintenanceEvent);
router.delete("/:id", deleteMaintenanceEvent);

export default router;
