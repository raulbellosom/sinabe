import { useReducer, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import CatalogContext from './CatalogContext';
import CatalogReducer from './CatalogReducer';
import useVehicleCatalogs from '../hooks/useVehicleCatalogs';

const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(CatalogReducer, {
    vehicleTypes: [],
    vehicleType: {},
    vehicleBrands: [],
    vehicleBrand: {},
    vehicleModels: [],
    vehicleModel: {},
    vehicleConditions: [],
    vehicleCondition: {},
    loading: true,
  });

  const { user, loading } = useAuthContext();

  const {
    fetchVehicleType,
    fetchVehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    fetchVehicleBrand,
    fetchVehicleBrands,
    createVehicleBrand,
    updateVehicleBrand,
    deleteVehicleBrand,
    fetchVehicleModel,
    fetchVehicleModels,
    createVehicleModel,
    updateVehicleModel,
    deleteVehicleModel,
    fetchVehicleConditions,
    fetchVehicleCondition,
    createVehicleCondition,
    updateVehicleCondition,
    deleteVehicleCondition,
  } = useVehicleCatalogs(dispatch);

  const loadVehiclesInfo = () => {
    fetchVehicleTypes();
    fetchVehicleBrands();
    fetchVehicleModels();
    fetchVehicleConditions();
  };

  useEffect(() => {
    if (!user || loading) {
      return;
    }
    loadVehiclesInfo();
  }, [user]);

  return (
    <CatalogContext.Provider
      value={{
        ...state,
        fetchVehicleTypes,
        fetchVehicleType,
        createVehicleType,
        updateVehicleType,
        deleteVehicleType,
        fetchVehicleBrand,
        fetchVehicleBrands,
        createVehicleBrand,
        updateVehicleBrand,
        deleteVehicleBrand,
        fetchVehicleModel,
        fetchVehicleModels,
        createVehicleModel,
        updateVehicleModel,
        deleteVehicleModel,
        fetchVehicleConditions,
        fetchVehicleCondition,
        createVehicleCondition,
        updateVehicleCondition,
        deleteVehicleCondition,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export default CatalogProvider;
