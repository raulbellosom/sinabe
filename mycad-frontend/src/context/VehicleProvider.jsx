import { useReducer } from 'react';
import VehicleContext from './VehicleContext';
import VehicleReducer from './VehicleReducer';
import useVehicle from '../hooks/useVehicle';

const VehicleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(VehicleReducer, {
    vehicles: [],
    pagination: {},
    vehicle: {},
    loading: true,
  });

  const { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } =
    useVehicle(dispatch);

  return (
    <VehicleContext.Provider
      value={{
        ...state,
        fetchVehicles,
        createVehicle,
        updateVehicle,
        deleteVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
