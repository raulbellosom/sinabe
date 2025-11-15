import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getInventoryLocations,
  getInventoryLocationById,
  createInventoryLocation,
  updateInventoryLocation,
  deleteInventoryLocation,
} from "../controllers/inventoryLocationController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas principales
router.route("/").get(getInventoryLocations).post(createInventoryLocation);

router
  .route("/:id")
  .get(getInventoryLocationById)
  .put(updateInventoryLocation)
  .delete(deleteInventoryLocation);

export default router;
