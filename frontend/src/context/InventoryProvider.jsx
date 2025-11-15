import { useReducer } from 'react';
import InventoryContext from './InventoryContext';
import InventoryReducer from './InventoryReducer';
import useInventory from '../hooks/useInventory';

const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(InventoryReducer, {
    inventories: [],
    inventory: {},
    pagination: {},
    loading: true,
    purchaseOrders: [],
    invoices: [],
    locations: [],
  });

  const {
    createInventory,
    createMultipleInventories,
    deleteInventory,
    fetchInventories,
    updateInventory,
    fetchPurchaseOrders,
    fetchInvoices,
    fetchLocations,
    createPurchaseOrder,
    createInvoice,
    createLocation,
  } = useInventory(dispatch);

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        createInventory,
        createMultipleInventories,
        deleteInventory,
        updateInventory,
        fetchInventories,
        fetchPurchaseOrders,
        fetchInvoices,
        fetchLocations,
        createPurchaseOrder,
        createInvoice,
        createLocation,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryProvider;
