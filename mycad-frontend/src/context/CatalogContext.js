import { createContext, useContext } from 'react';

const CatalogContext = createContext({
  vehicleTypes: [],
  vehicleType: {},
  vehicleBrands: [],
  vehicleBrand: {},
  vehicleModels: [],
  vehicleModel: {},
  vehicleConditions: [],
  vehicleCondition: {},
  loading: true,
  fetchVehicleTypes: async () => {},
  fetchVehicleType: async () => {},
  createVehicleType: async () => {},
  updateVehicleType: async () => {},
  deleteVehicleType: async () => {},
  fetchVehicleBrands: async () => {},
  fetchVehicleBrand: async () => {},
  createVehicleBrand: async () => {},
  updateVehicleBrand: async () => {},
  deleteVehicleBrand: async () => {},
  fetchVehicleModels: async () => {},
  fetchVehicleModel: async () => {},
  createVehicleModel: async () => {},
  updateVehicleModel: async () => {},
  deleteVehicleModel: async () => {},
  createMultipleModels: async () => {},
  fetchVehicleConditions: async () => {},
  fetchVehicleCondition: async () => {},
  createVehicleCondition: async () => {},
  updateVehicleCondition: async () => {},
  deleteVehicleCondition: async () => {},
});

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContext;
