import { createContext, useContext } from 'react';

const VehicleContext = createContext({
  vehicles: [],
  vehicleTypes: [],
  vehicleType: {},
  loading: true,
  createVehicle: () => {},
  updateVehicle: () => {},
  deleteVehicle: () => {},
  fetchVehicles: () => {},
  fetchVehicleTypes: () => {},
  fetchVehicleType: () => {},
});
export const useVehicleContext = () => useContext(VehicleContext);

export default VehicleContext;
