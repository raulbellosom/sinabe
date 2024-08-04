import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles as searchVehiclesAPI,
} from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

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

  const fetchVehicle = useMutation(getVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const searchVehicles = ({ searchTerm, sortBy, order, page, pageSize }) => {
    return useQuery(
      ['vehicles', { searchTerm, sortBy, order, page, pageSize }],
      ({signal}) => searchVehiclesAPI({ searchTerm, sortBy, order, page, pageSize, signal }),
      {
        staleTime: Infinity,
        onSuccess: (data) => {
          dispatch({ type: 'FETCH_VEHICLES_SUCCESS', payload: data });
        },
        onError: (error) => {
          Notifies('error', 'Error al buscar vehículos');
        },
      },
    );
  };

  const createVehicleMutation = useMutation(createVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'CREATE_VEHICLE', payload: data });
      Notifies('success', 'Vehiculo creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleMutation = useMutation(updateVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'UPDATE_VEHICLE', payload: data });
      Notifies('success', 'Vehiculo actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleMutation = useMutation(deleteVehicle, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicles');
      dispatch({ type: 'DELETE_VEHICLE', payload: data.data });
      Notifies('success', 'Vehiculo eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchVehicles: fetchVehicles.mutate,
    fetchVehicle: fetchVehicle.mutate,
    searchVehicles: searchVehicles,
    createVehicle: (values) => {
      return createVehicleMutation.mutateAsync(values);
    },
    updateVehicle: (values) => {
      return updateVehicleMutation.mutateAsync(values);
    },
    deleteVehicle: deleteVehicleMutation.mutate,
  };
};

export default useVehicle;
