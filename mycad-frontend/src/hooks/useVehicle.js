import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/api';
import { useContext } from 'react';
import VehicleContext from '../context/VehicleContext';

const useVehicle = () => {
  const { dispatch } = useContext(VehicleContext);
  const queryClient = useQueryClient();

  const { data: vehicles, status } = useQuery('vehicles', getVehicles, {
    onSuccess: (data) => {
      dispatch({ type: 'SET_VEHICLES', payload: data });
    },
  });

  const createVehicleMutation = useMutation(createVehicle, {
    onSuccess: () => {
      queryClient.invalidateQueries('vehicles');
    },
  });

  const updateVehicleMutation = useMutation(updateVehicle, {
    onSuccess: () => {
      queryClient.invalidateQueries('vehicles');
    },
  });

  const deleteVehicleMutation = useMutation(deleteVehicle, {
    onSuccess: () => {
      queryClient.invalidateQueries('vehicles');
    },
  });

  return {
    vehicles,
    status,
    createVehicle: createVehicleMutation.mutate,
    updateVehicle: updateVehicleMutation.mutate,
    deleteVehicle: deleteVehicleMutation.mutate,
  };
};

export default useVehicle;
