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
  createCondition,
  updateCondition,
  deleteCondition,
  deleteVehicleBrand,
  deleteVehicleType,
  getConditionById,
  getConditions,
} from "../controllers/vehicleModelController.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);
router
  .route("/vehicleTypes")
  .get(protect, getVehicleTypes)
  .post(protect, createVehicleType);
router
  .route("/vehicleBrands")
  .get(protect, getVehicleBrands)
  .post(protect, createVehicleBrand);
router
  .route("/vehicleModels")
  .get(protect, getVehicleModels)
  .post(protect, createVehicleModel);
router
  .route("/vehicleConditions")
  .get(protect, getConditions)
  .post(protect, createCondition);

router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

router
  .route("/vehicleTypes/:id")
  .get(protect, getVehicleTypeById)
  .put(protect, updateVehicleType)
  .delete(protect, deleteVehicleType);
router
  .route("/vehicleBrands/:id")
  .get(protect, getVehicleBrandById)
  .put(protect, updateVehicleBrand)
  .delete(protect, deleteVehicleBrand);
router
  .route("/vehicleModels/:id")
  .get(protect, getVehicleModelById)
  .put(protect, updateVehicleModel)
  .delete(protect, deleteVehicleModel);
router
  .route("/vehicleConditions/:id")
  .get(protect, getConditionById)
  .put(protect, updateCondition)
  .delete(protect, deleteCondition);

export default router;
