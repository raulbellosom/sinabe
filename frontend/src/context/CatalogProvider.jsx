import { useReducer, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import CatalogContext from './CatalogContext';
import CatalogReducer from './CatalogReducer';
import useInventoryCatalogs from '../hooks/useInventoryCatalogs';

const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(CatalogReducer, {
    inventoryTypes: [],
    inventoryType: {},
    inventoryBrands: [],
    inventoryBrand: {},
    inventoryModels: [],
    inventoryModel: {},
    inventoryConditions: [],
    inventoryCondition: {},
    loading: true,
  });

  const { user, loading } = useAuthContext();

  const {
    fetchInventoryType,
    fetchInventoryTypes,
    createInventoryType,
    updateInventoryType,
    deleteInventoryType,
    fetchInventoryBrand,
    fetchInventoryBrands,
    createInventoryBrand,
    updateInventoryBrand,
    deleteInventoryBrand,
    fetchInventoryModel,
    fetchInventoryModels,
    createInventoryModel,
    updateInventoryModel,
    deleteInventoryModel,
    createMultipleModels,
    fetchInventoryConditions,
    fetchInventoryCondition,
    createInventoryCondition,
    updateInventoryCondition,
    deleteInventoryCondition,
  } = useInventoryCatalogs(dispatch);

  const loadInventories = () => {
    fetchInventoryTypes();
    fetchInventoryBrands();
    fetchInventoryModels();
    fetchInventoryConditions();
  };

  useEffect(() => {
    if (!user || loading) {
      return;
    }
    loadInventories();
  }, [user]);

  return (
    <CatalogContext.Provider
      value={{
        ...state,
        fetchInventoryTypes,
        fetchInventoryType,
        createInventoryType,
        updateInventoryType,
        deleteInventoryType,
        fetchInventoryBrand,
        fetchInventoryBrands,
        createInventoryBrand,
        updateInventoryBrand,
        deleteInventoryBrand,
        fetchInventoryModel,
        fetchInventoryModels,
        createInventoryModel,
        updateInventoryModel,
        deleteInventoryModel,
        createMultipleModels,
        fetchInventoryConditions,
        fetchInventoryCondition,
        createInventoryCondition,
        updateInventoryCondition,
        deleteInventoryCondition,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export default CatalogProvider;
