import { createContext, useContext } from 'react';

const CatalogContext = createContext({
  inventoryTypes: [],
  inventoryType: {},
  inventoryBrands: [],
  inventoryBrand: {},
  inventoryModels: [],
  inventoryModel: {},
  inventoryConditions: [],
  inventoryCondition: {},
  loading: true,
  fetchInventoryTypes: async () => {},
  fetchInventoryType: async () => {},
  createInventoryType: async () => {},
  updateInventoryType: async () => {},
  deleteInventoryType: async () => {},
  fetchInventoryBrands: async () => {},
  fetchInventoryBrand: async () => {},
  createInventoryBrand: async () => {},
  updateInventoryBrand: async () => {},
  deleteInventoryBrand: async () => {},
  fetchInventoryModels: async () => {},
  fetchInventoryModel: async () => {},
  createInventoryModel: async () => {},
  updateInventoryModel: async () => {},
  deleteInventoryModel: async () => {},
  createMultipleModels: async () => {},
  fetchInventoryConditions: async () => {},
  fetchInventoryCondition: async () => {},
  createInventoryCondition: async () => {},
  updateInventoryCondition: async () => {},
  deleteInventoryCondition: async () => {},
});

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContext;
