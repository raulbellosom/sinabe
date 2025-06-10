import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories,
  checkSerialNumber,
  assignMissingFolios,
} from "../controllers/inventoryController.js";
import {
  getInventoryTypes,
  getInventoryTypeById,
  getInventoryBrands,
  getInventoryBrandById,
  getInventoryModels,
  getInventoryModelById,
  searchModels,
  createInventoryBrand,
  updateInventoryBrand,
  createInventoryModel,
  updateInventoryModel,
  createInventoryType,
  updateInventoryType,
  deleteInventoryModel,
  createCondition,
  updateCondition,
  deleteCondition,
  deleteInventoryBrand,
  deleteInventoryType,
  getConditionById,
  getConditions,
} from "../controllers/inventoryModelController.js";
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  addCustomFieldValue,
  getCustomFieldValues,
} from "../controllers/customFieldController.js";
import { migrateInventory } from "../controllers/migrateController.js";
import { createMultipleInventories } from "../controllers/inventoryExtrasController.js";
import { createMultipleModels } from "../controllers/inventoryModelExtrasController.js";
import {
  processImages,
  upload,
} from "../controllers/uploadImagesController.js";
import { processFiles } from "../controllers/uploadFilesController.js";

const router = express.Router();
router.route("/assignMissingFolios").get(assignMissingFolios);

router
  .route("/")
  .get(protect, getInventories)
  .post(
    protect,
    upload.fields([{ name: "images" }, { name: "files" }]),
    processImages,
    processFiles,
    createInventory
  );
router.route("/migrate").post(protect, migrateInventory);
router.route("/checkSerialNumber").post(protect, checkSerialNumber);
router
  .route("/inventoryTypes")
  .get(protect, getInventoryTypes)
  .post(protect, createInventoryType);
router
  .route("/inventoryBrands")
  .get(protect, getInventoryBrands)
  .post(protect, createInventoryBrand);
router
  .route("/inventoryModels")
  .get(protect, getInventoryModels)
  .post(protect, createInventoryModel);
router
  .route("/inventoryConditions")
  .get(protect, getConditions)
  .post(protect, createCondition);
router.route("/search").get(protect, searchInventories);
router
  .route("/createMultipleInventories")
  .post(protect, upload.single("csvFile"), createMultipleInventories);
router.route("/inventoryModels/search").get(protect, searchModels);
router
  .route("/inventoryModels/createMultipleModels")
  .post(protect, upload.single("csvFile"), createMultipleModels);
router
  .route("/customFields")
  .get(protect, getCustomFields)
  .post(protect, createCustomField);
router.route("/customFields/values").post(protect, addCustomFieldValue);
router
  .route("/:id")
  .get(protect, getInventoryById)
  .put(
    protect,
    upload.fields([{ name: "images" }, { name: "files" }]),
    processImages,
    processFiles,
    updateInventory
  )
  .delete(protect, deleteInventory);
router
  .route("/inventoryTypes/:id")
  .get(protect, getInventoryTypeById)
  .put(protect, updateInventoryType)
  .delete(protect, deleteInventoryType);
router
  .route("/inventoryBrands/:id")
  .get(protect, getInventoryBrandById)
  .put(protect, updateInventoryBrand)
  .delete(protect, deleteInventoryBrand);
router
  .route("/inventoryModels/:id")
  .get(protect, getInventoryModelById)
  .put(protect, updateInventoryModel)
  .delete(protect, deleteInventoryModel);
router
  .route("/inventoryConditions/:id")
  .get(protect, getConditionById)
  .put(protect, updateCondition)
  .delete(protect, deleteCondition);

router
  .route("/customFields/:id")
  .put(protect, updateCustomField)
  .delete(protect, deleteCustomField);
router
  .route("/customFields/:customFieldId/values")
  .get(protect, getCustomFieldValues);

export default router;
