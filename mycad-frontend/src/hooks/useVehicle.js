import { useMutation, useQueryClient } from 'react-query';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleTypes,
  getVehicleType,
} from '../services/api';
import { useLoading } from '../context/LoadingContext';

const useVehicle = (dispatch) => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };
  const fetchVehicles = useMutation(getVehicles, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLES_SUCCESS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleMutation = useMutation(createVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'CREATE_VEHICLE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleMutation = useMutation(updateVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'UPDATE_VEHICLE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleMutation = useMutation(deleteVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'DELETE_VEHICLE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleTypes = useMutation(getVehicleTypes, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_TYPES', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleType = useMutation(getVehicleType, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_TYPE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchVehicles: fetchVehicles.mutate,
    createVehicle: createVehicleMutation.mutate,
    updateVehicle: updateVehicleMutation.mutate,
    deleteVehicle: deleteVehicleMutation.mutate,
    fetchVehicleTypes: fetchVehicleTypes.mutate,
    fetchVehicleType: fetchVehicleType.mutate,
  };
};

export default useVehicle;
