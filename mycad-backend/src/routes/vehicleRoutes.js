import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";
import {
  getVehicleTypes,
  getVehicleTypeById,
  getVehicleBrands,
  getVehicleBrandById,
  getVehicleModels,
  getVehicleModelById,
  createVehicleBrand,
  updateVehicleBrand,
  createVehicleModel,
  updateVehicleModel,
  createVehicleType,
  updateVehicleType,
  deleteVehicleModel,
} from "../controllers/vehicleModelController.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);

router.route("/vehicleTypes").get(protect, getVehicleTypes);
router.route("/vehicleBrands").get(protect, getVehicleBrands);
router.route("/vehicleModels").get(protect, getVehicleModels);
router.route("/vehicleBrands").post(protect, createVehicleBrand);
router.route("/vehicleModels").post(protect, createVehicleModel);
router.route("/vehicleTypes").post(protect, createVehicleType);

router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

router.route("/vehicleTypes/:id").get(protect, getVehicleTypeById);
router.route("/vehicleBrands/:id").get(protect, getVehicleBrandById);
router.route("/vehicleModels/:id").get(protect, getVehicleModelById);
router.route("/vehicleBrands/:id").put(protect, updateVehicleBrand);
router.route("/vehicleModels/:id").put(protect, updateVehicleModel);
router.route("/vehicleTypes/:id").put(protect, updateVehicleType);
router.route("/vehicleModels/:id").delete(protect, deleteVehicleModel);

export default router;
