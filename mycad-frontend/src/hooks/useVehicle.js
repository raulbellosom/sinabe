import { useMutation, useQueryClient } from 'react-query';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleTypes,
  getVehicleType,
  getVehicleBrand,
  getVehicleBrands,
  getVehicleModel,
  getVehicleModels,
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

  const fetchVehicleBrands = useMutation(getVehicleBrands, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_BRANDS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleBrand = useMutation(getVehicleBrand, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_BRAND', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleModels = useMutation(getVehicleModels, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_MODELS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleModel = useMutation(getVehicleModel, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_MODEL', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchVehicles: fetchVehicles.mutate,
    fetchVehicle: fetchVehicle.mutate,
    createVehicle: (values) => {
      return createVehicleMutation.mutateAsync(values);
    },
    updateVehicle: (values) => {
      return updateVehicleMutation.mutateAsync(values);
    },
    deleteVehicle: deleteVehicleMutation.mutate,
    fetchVehicleTypes: fetchVehicleTypes.mutate,
    fetchVehicleType: fetchVehicleType.mutate,
    fetchVehicleBrands: fetchVehicleBrands.mutate,
    fetchVehicleBrand: fetchVehicleBrand.mutate,
    fetchVehicleModels: fetchVehicleModels.mutate,
    fetchVehicleModel: fetchVehicleModel.mutate,
  };
};

export default useVehicle;
