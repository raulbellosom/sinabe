import { createContext, useContext } from 'react';

const VehicleContext = createContext({
    vehicles: [],
});
export const useVehicleContext = () => useContext(VehicleContext);

export default VehicleContext;
