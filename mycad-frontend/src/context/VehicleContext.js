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
  createVehicle: () => {},
  updateVehicle: () => {},
  deleteVehicle: () => {},
  fetchVehicles: () => {},
  fetchVehicle: () => {},
  fetchVehicleTypes: () => {},
  fetchVehicleType: () => {},
  fetchVehicleBrands: () => {},
  fetchVehicleBrand: () => {},
  fetchVehicleModels: () => {},
  fetchVehicleModel: () => {},
  createVehicleBrand: () => {},
  updateVehicleBrand: () => {},
  createVehicleModel: () => {},
  updateVehicleModel: () => {},
  createVehicleType: () => {},
  updateVehicleType: () => {},
  deleteVehicleModel: () => {},
});
export const useVehicleContext = () => useContext(VehicleContext);

export default VehicleContext;
