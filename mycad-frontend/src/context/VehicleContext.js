import { createContext, useContext } from 'react';

const VehicleContext = createContext({
  vehicles: [],
  vehicle: {},
  vehicleTypes: [],
  vehicleType: {},
  vehicleBrands: [],
  vehicleBrand: {},
  vehicleModels: [],
  vehicleModel: {},
  loading: true,
  createVehicle: async () => {},
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  fetchVehicles: async () => {},
  fetchVehicle: async () => {},
  fetchVehicleTypes: async () => {},
  fetchVehicleType: async () => {},
  fetchVehicleBrands: async () => {},
  fetchVehicleBrand: async () => {},
  fetchVehicleModels: async () => {},
  fetchVehicleModel: async () => {},
  createVehicleBrand: async () => {},
  updateVehicleBrand: async () => {},
  createVehicleModel: async () => {},
  updateVehicleModel: async () => {},
  createVehicleType: async () => {},
  updateVehicleType: async () => {},
  deleteVehicleModel: async () => {},
});
export const useVehicleContext = () => useContext(VehicleContext);

export default VehicleContext;
