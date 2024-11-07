import { createContext, useContext } from 'react';

const InventoryContext = createContext({
  loading: true,
  pagination: {},
  inventories: [],
  inventory: {},
  fetchInventories: async () => {},
  createInventory: async () => {},
  updateInventory: async () => {},
  deleteInventory: async () => {},
  searchInventories: async () => {},
  createMultipleInventories: async () => {},
});
export const useInventoryContext = () => useContext(InventoryContext);

export default InventoryContext;
