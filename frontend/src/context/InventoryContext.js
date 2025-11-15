import { createContext, useContext } from 'react';

const InventoryContext = createContext({
  loading: true,
  pagination: {},
  inventories: [],
  inventory: {},
  purchaseOrders: [],
  invoices: [],
  locations: [],
  fetchInventories: async () => {},
  createInventory: async () => {},
  updateInventory: async () => {},
  deleteInventory: async () => {},
  searchInventories: async () => {},
  createMultipleInventories: async () => {},
  fetchPurchaseOrders: async () => {},
  fetchInvoices: async () => {},
  fetchLocations: async () => {},
  createPurchaseOrder: async () => {},
  createInvoice: async () => {},
  createLocation: async () => {},
});
export const useInventoryContext = () => useContext(InventoryContext);

export default InventoryContext;
