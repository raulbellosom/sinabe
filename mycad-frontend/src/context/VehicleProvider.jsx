import { useReducer, useEffect } from 'react';
import VehicleContext from './VehicleContext';
import VehicleReducer from './VehicleReducer';
import useVehicle from '../hooks/useVehicle';

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
  } = useVehicle(dispatch);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    loadVehiclesInfo();
  }, []);

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
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
