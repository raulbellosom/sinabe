import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);

router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

export default router;
