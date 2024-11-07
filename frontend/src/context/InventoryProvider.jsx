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
  });

  const {
    createInventory,
    createMultipleInventories,
    deleteInventory,
    fetchInventories,
    updateInventory,
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
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryProvider;
