import { createContext, useContext } from 'react';

const VehicleContext = createContext({
  vehicles: [],
  pagination: {},
  vehicle: {},
  loading: true,
  fetchVehicles: async () => {},
  fetchVehicle: async () => {},
  createVehicle: async () => {},
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  searchVehicles: async () => {},
  createMultipleVehicles: async () => {},
});
export const useVehicleContext = () => useContext(VehicleContext);

export default VehicleContext;
