import { useMutation, useQueryClient } from 'react-query';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
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
  getVehicleConditions,
  getVehicleCondition,
  createVehicleCondition,
  updateVehicleCondition,
  deleteVehicleCondition,
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

  const createVehicleTypeMutation = useMutation(createVehicleType, {
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

  const updateVehicleTypeMutation = useMutation(updateVehicleType, {
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

  const deleteVehicleTypeMutation = useMutation(deleteVehicleType, {
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

  const createVehicleBrandMutation = useMutation(createVehicleBrand, {
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

  const updateVehicleBrandMutation = useMutation(updateVehicleBrand, {
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

  const deleteVehicleBrandMutation = useMutation(deleteVehicleBrand, {
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

  const createVehicleModelMutation = useMutation(createVehicleModel, {
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

  const updateVehicleModelMutation = useMutation(updateVehicleModel, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('vehicleModels');
      dispatch({ type: 'UPDATE_VEHICLE_MODEL', payload: data });
      Notifies('success', 'Modelo de vehiculo actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el modelo de vehiculo');
    },
    onSettled: () => setLoading(false),
  });

  const deleteVehicleModelMutation = useMutation(deleteVehicleModel, {
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

  const fetchVehicleConditions = useMutation(getVehicleConditions, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_CONDITIONS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchVehicleCondition = useMutation(getVehicleCondition, {
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_VEHICLE_CONDITION', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createVehicleConditionMutation = useMutation(createVehicleCondition, {
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

  const updateVehicleConditionMutation = useMutation(updateVehicleCondition, {
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

  const deleteVehicleConditionMutation = useMutation(deleteVehicleCondition, {
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

export default useVehicle;
