import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleTypes,
  getVehicleTypeById,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);

router.route("/vehicleTypes").get(protect, getVehicleTypes);

router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

router.route("/vehicleTypes/:id").get(protect, getVehicleTypeById);

export default router;
