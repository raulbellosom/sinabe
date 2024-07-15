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
    fetchVehicleBrand,
    fetchVehicleBrands,
    fetchVehicleModel,
    fetchVehicleModels,
    createVehicleBrand,
    updateVehicleBrand,
    createVehicleModel,
    updateVehicleModel,
    createVehicleType,
    updateVehicleType,
    deleteVehicleModel,
  } = useVehicle(dispatch);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    loadVehiclesInfo();
  }, [user]);

  const loadVehiclesInfo = () => {
    fetchVehicles();
    fetchVehicleTypes();
    fetchVehicleBrands();
    fetchVehicleModels();
  };

  return (
    <VehicleContext.Provider
      value={{
        ...state,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        fetchVehicleType,
        fetchVehicleTypes,
        fetchVehicle,
        fetchVehicles,
        fetchVehicleBrand,
        fetchVehicleBrands,
        fetchVehicleModel,
        fetchVehicleModels,
        createVehicleBrand,
        updateVehicleBrand,
        createVehicleModel,
        updateVehicleModel,
        createVehicleType,
        updateVehicleType,
        deleteVehicleModel,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
