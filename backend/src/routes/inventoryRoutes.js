import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  getInventories,
  getInventoryById,
  getPublicInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories,
  checkSerialNumber,
  assignMissingFolios,
  bulkUpdateStatus,
  getPurchaseOrdersList,
  getInvoicesList,
  getInventoryLocationsList,
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
// router.route("/assignMissingFolios").get(assignMissingFolios);

// ── Ruta pública (sin autenticación) para consulta por QR / handheld ──
router.route("/public/:id").get(getPublicInventoryById);

router
  .route("/")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    getInventories,
  )
  .post(
    protect,
    checkPermission("create_inventories"),
    upload.fields([{ name: "images" }, { name: "files" }]),
    processImages,
    processFiles,
    createInventory,
  );
router
  .route("/migrate")
  .post(protect, checkPermission("create_inventories"), migrateInventory);
router
  .route("/checkSerialNumber")
  .post(
    protect,
    checkPermission("view_inventories", "create_inventories"),
    checkSerialNumber,
  );
router
  .route("/inventoryTypes")
  .get(protect, checkPermission("view_inventories_types"), getInventoryTypes)
  .post(
    protect,
    checkPermission("create_inventories_types"),
    createInventoryType,
  );
router
  .route("/inventoryBrands")
  .get(protect, checkPermission("view_inventories_brands"), getInventoryBrands)
  .post(
    protect,
    checkPermission("create_inventories_brands"),
    createInventoryBrand,
  );
router
  .route("/inventoryModels")
  .get(protect, checkPermission("view_inventories_models"), getInventoryModels)
  .post(
    protect,
    checkPermission("create_inventories_models"),
    createInventoryModel,
  );
router
  .route("/inventoryConditions")
  .get(protect, checkPermission("view_inventories_conditions"), getConditions)
  .post(
    protect,
    checkPermission("create_inventories_conditions"),
    createCondition,
  );
router
  .route("/search")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    searchInventories,
  );
router
  .route("/createMultipleInventories")
  .post(
    protect,
    checkPermission("create_inventories"),
    upload.single("csvFile"),
    createMultipleInventories,
  );
router
  .route("/inventoryModels/search")
  .get(protect, checkPermission("view_inventories_models"), searchModels);
router
  .route("/inventoryModels/createMultipleModels")
  .post(
    protect,
    checkPermission("create_inventories_models"),
    upload.single("csvFile"),
    createMultipleModels,
  );
router
  .route("/customFields")
  .get(
    protect,
    checkPermission("view_inventories_custom_fields"),
    getCustomFields,
  )
  .post(
    protect,
    checkPermission("create_inventories_custom_fields"),
    createCustomField,
  );
router
  .route("/customFields/values")
  .post(protect, checkPermission("edit_inventories"), addCustomFieldValue);

// Rutas para obtener listas de Purchase Orders e Invoices para autocomplete
// IMPORTANTE: Estas rutas deben estar ANTES de /:id para evitar conflictos
router
  .route("/purchase-orders-list")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    getPurchaseOrdersList,
  );
router
  .route("/invoices-list")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    getInvoicesList,
  );
router
  .route("/locations-list")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    getInventoryLocationsList,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_inventories", "view_self_inventories"),
    getInventoryById,
  )
  .put(
    protect,
    checkPermission("edit_inventories"),
    upload.fields([{ name: "images" }, { name: "files" }]),
    processImages,
    processFiles,
    updateInventory,
  )
  .delete(protect, checkPermission("delete_inventories"), deleteInventory);
router
  .route("/inventoryTypes/:id")
  .get(protect, checkPermission("view_inventories_types"), getInventoryTypeById)
  .put(protect, checkPermission("edit_inventories_types"), updateInventoryType)
  .delete(
    protect,
    checkPermission("delete_inventories_types"),
    deleteInventoryType,
  );
router
  .route("/inventoryBrands/:id")
  .get(
    protect,
    checkPermission("view_inventories_brands"),
    getInventoryBrandById,
  )
  .put(
    protect,
    checkPermission("edit_inventories_brands"),
    updateInventoryBrand,
  )
  .delete(
    protect,
    checkPermission("delete_inventories_brands"),
    deleteInventoryBrand,
  );
router
  .route("/inventoryModels/:id")
  .get(
    protect,
    checkPermission("view_inventories_models"),
    getInventoryModelById,
  )
  .put(
    protect,
    checkPermission("edit_inventories_models"),
    updateInventoryModel,
  )
  .delete(
    protect,
    checkPermission("delete_inventories_models"),
    deleteInventoryModel,
  );
router
  .route("/inventoryConditions/:id")
  .get(
    protect,
    checkPermission("view_inventories_conditions"),
    getConditionById,
  )
  .put(protect, checkPermission("edit_inventories_conditions"), updateCondition)
  .delete(
    protect,
    checkPermission("delete_inventories_conditions"),
    deleteCondition,
  );

router
  .route("/customFields/:id")
  .put(
    protect,
    checkPermission("edit_inventories_custom_fields"),
    updateCustomField,
  )
  .delete(
    protect,
    checkPermission("delete_inventories_custom_fields"),
    deleteCustomField,
  );
router
  .route("/customFields/:customFieldId/values")
  .get(
    protect,
    checkPermission("view_inventories_custom_fields"),
    getCustomFieldValues,
  );

// Ruta para actualización masiva de estados
router
  .route("/bulk-status")
  .patch(protect, checkPermission("edit_inventories"), bulkUpdateStatus);

export default router;
