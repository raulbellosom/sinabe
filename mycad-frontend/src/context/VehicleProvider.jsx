import { useReducer, useEffect } from 'react';
import VehicleContext from './VehicleContext';
import VehicleReducer from './VehicleReducer';
import axios from 'axios';
import useVehicle from '../hooks/useVehicle';

const VehicleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(VehicleReducer, {
    vehicles: [],
    loading: true,
  });

  const {  fetchVehicles } = useVehicle(dispatch);

  useEffect(() => {
    // const fetchVehicles = async () => {
    //   try {
    //     const response = await axios.get('/api/vehicles');
    //     dispatch({ type: 'FETCH_VEHICLES_SUCCESS', payload: response.data });
    //   } catch (error) {
    //     dispatch({ type: 'FETCH_VEHICLES_ERROR' });
    //   }
    // };
    fetchVehicles();
  }, []);
  return (
    <VehicleContext.Provider value={{ ...state, dispatch }}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
