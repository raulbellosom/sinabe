import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVehicleTypes,
  getVehicleType,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getVehicleBrand,
  getVehicleBrands,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand,
  getVehicleModels,
  getVehicleModel,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  createMultipleModels,
  getVehicleConditions,
  getVehicleCondition,
  createVehicleCondition,
  updateVehicleCondition,
  deleteVehicleCondition,
} from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

const useVehicleCatalogs = (dispatch) => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };

  const fetchVehicleTypes = useMutation({
    mutationFn: getVehicleTypes,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_TYPES', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleType = useMutation({
    mutationFn: getVehicleType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_TYPE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleTypeMutation = useMutation({
    mutationFn: createVehicleType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleTypes');
      dispatch({ type: 'CREATE_VEHICLE_TYPE', payload: data });
      Notifies('success', 'Tipo de vehiculo creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el tipo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleTypeMutation = useMutation({
    mutationFn: updateVehicleType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleTypes');
      dispatch({ type: 'UPDATE_VEHICLE_TYPE', payload: data });
      Notifies('success', 'Tipo de vehiculo actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el tipo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleTypeMutation = useMutation({
    mutationFn: deleteVehicleType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleTypes');
      dispatch({ type: 'DELETE_VEHICLE_TYPE', payload: data.data });
      Notifies('success', 'Tipo de vehiculo eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el tipo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleBrands = useMutation({
    mutationFn: getVehicleBrands,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_BRANDS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleBrand = useMutation({
    mutationFn: getVehicleBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_BRAND', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleBrandMutation = useMutation({
    mutationFn: createVehicleBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleBrands');
      dispatch({ type: 'CREATE_VEHICLE_BRAND', payload: data });
      Notifies('success', 'Marca de vehiculo creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear la marca de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleBrandMutation = useMutation({
    mutationFn: updateVehicleBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleBrands');
      dispatch({ type: 'UPDATE_VEHICLE_BRAND', payload: data });
      Notifies('success', 'Marca de vehiculo actualizada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar la marca de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleBrandMutation = useMutation({
    mutationFn: deleteVehicleBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleBrands');
      dispatch({ type: 'DELETE_VEHICLE_BRAND', payload: data.data });
      Notifies('success', 'Marca de vehiculo eliminada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar la marca de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleModels = useMutation({
    mutationFn: getVehicleModels,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_MODELS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleModel = useMutation({
    mutationFn: getVehicleModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_MODEL', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleModelMutation = useMutation({
    mutationFn: createVehicleModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleModels');
      dispatch({ type: 'CREATE_VEHICLE_MODEL', payload: data });
      Notifies('success', 'Modelo de vehiculo creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el modelo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleModelMutation = useMutation({
    mutationFn: updateVehicleModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleModels');
      console.log(data);
      dispatch({ type: 'UPDATE_VEHICLE_MODEL', payload: data });
      Notifies('success', 'Modelo de vehiculo actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el modelo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleModelMutation = useMutation({
    mutationFn: deleteVehicleModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleModels');
      dispatch({ type: 'DELETE_VEHICLE_MODEL', payload: data.data });
      Notifies('success', 'Modelo de vehiculo eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el modelo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const createMultipleModelsMutation = useMutation({
    mutationFn: createMultipleModels,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleModels');
      dispatch({ type: 'CREATE_MULTIPLE_MODELS', payload: data });
      Notifies('success', 'Modelos de vehiculos creados exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear los modelos de vehiculos');
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleConditions = useMutation({
    mutationFn: getVehicleConditions,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_CONDITIONS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleCondition = useMutation({
    mutationFn: getVehicleCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_CONDITION', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleConditionMutation = useMutation({
    mutationFn: createVehicleCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleConditions');
      dispatch({ type: 'CREATE_VEHICLE_CONDITION', payload: data });
      Notifies('success', 'Condicion de vehiculo creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear la condicion de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const updateVehicleConditionMutation = useMutation({
    mutationFn: updateVehicleCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleConditions');
      dispatch({ type: 'UPDATE_VEHICLE_CONDITION', payload: data });
      Notifies('success', 'Condicion de vehiculo actualizada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar la condicion de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleConditionMutation = useMutation({
    mutationFn: deleteVehicleCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleConditions');
      dispatch({ type: 'DELETE_VEHICLE_CONDITION', payload: data.data });
      Notifies('success', 'Condicion de vehiculo eliminada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar la condicion de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchVehicleTypes: fetchVehicleTypes.mutate,
    fetchVehicleType: fetchVehicleType.mutate,
    createVehicleType: (values) => {
      return createVehicleTypeMutation.mutateAsync(values);
    },
    updateVehicleType: (values) => {
      return updateVehicleTypeMutation.mutateAsync(values);
    },
    deleteVehicleType: deleteVehicleTypeMutation.mutate,
    fetchVehicleBrands: fetchVehicleBrands.mutate,
    fetchVehicleBrand: fetchVehicleBrand.mutate,
    createVehicleBrand: (values) => {
      return createVehicleBrandMutation.mutateAsync(values);
    },
    updateVehicleBrand: (values) => {
      return updateVehicleBrandMutation.mutateAsync(values);
    },
    deleteVehicleBrand: deleteVehicleBrandMutation.mutate,
    fetchVehicleModels: fetchVehicleModels.mutate,
    fetchVehicleModel: fetchVehicleModel.mutate,
    createVehicleModel: (values) => {
      return createVehicleModelMutation.mutateAsync(values);
    },
    updateVehicleModel: (values) => {
      return updateVehicleModelMutation.mutateAsync(values);
    },
    deleteVehicleModel: deleteVehicleModelMutation.mutate,
    createMultipleModels: (values) => {
      return createMultipleModelsMutation.mutateAsync(values);
    },
    fetchVehicleConditions: fetchVehicleConditions.mutate,
    fetchVehicleCondition: fetchVehicleCondition.mutate,
    createVehicleCondition: (values) => {
      return createVehicleConditionMutation.mutateAsync(values);
    },
    updateVehicleCondition: (values) => {
      return updateVehicleConditionMutation.mutateAsync(values);
    },
    deleteVehicleCondition: deleteVehicleConditionMutation.mutate,
  };
};

export default useVehicleCatalogs;
