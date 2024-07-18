import { useReducer, useEffect } from 'react';
import VehicleContext from './VehicleContext';
import VehicleReducer from './VehicleReducer';
import useVehicle from '../hooks/useVehicle';
import { useAuthContext } from './AuthContext';

const VehicleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(VehicleReducer, {
    vehicles: [],
    vehicle: {},
    loading: true,
    vehicleTypes: [],
    vehicleType: {},
    vehicleBrands: [],
    vehicleBrand: {},
    vehicleModels: [],
    vehicleModel: {},
    vehicleConditions: [],
    vehicleCondition: {},
  });

  const { user, loading } = useAuthContext();

  const {
    fetchVehicles,
    fetchVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
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
  } = useVehicle(dispatch);

  const loadVehiclesInfo = () => {
    fetchVehicles();
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
    <VehicleContext.Provider
      value={{
        ...state,
        fetchVehicles,
        fetchVehicle,
        createVehicle,
        updateVehicle,
        deleteVehicle,
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
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
