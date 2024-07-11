import { useReducer, useEffect } from 'react';
import VehicleContext from './VehicleContext';
import VehicleReducer from './VehicleReducer';
import useVehicle from '../hooks/useVehicle';

const VehicleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(VehicleReducer, {
    vehicles: [],
    loading: true,
    vehicleTypes: [],
    vehicleType: {},
  });

  const {
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    fetchVehicleType,
    fetchVehicleTypes,
  } = useVehicle(dispatch);

  useEffect(() => {
    fetchVehicles();
    fetchVehicleTypes();
  }, []);
  return (
    <VehicleContext.Provider
      value={{
        ...state,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        fetchVehicleType,
        fetchVehicleTypes,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
