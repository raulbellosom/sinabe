import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
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
      setLoading(false)
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
    fetchVehicles: fetchVehicles.mutate,
    createVehicle: createVehicleMutation.mutate,
    updateVehicle: updateVehicleMutation.mutate,
    deleteVehicle: deleteVehicleMutation.mutate,
  };
};

export default useVehicle;
