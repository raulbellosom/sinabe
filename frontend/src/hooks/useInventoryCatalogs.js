import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventoryTypes,
  getInventoryType,
  createInventoryType,
  updateInventoryType,
  deleteInventoryType,
  getInventoryBrand,
  getInventoryBrands,
  createInventoryBrand,
  updateInventoryBrand,
  deleteInventoryBrand,
  getInventoryModels,
  getInventoryModel,
  createInventoryModel,
  updateInventoryModel,
  deleteInventoryModel,
  createMultipleModels,
  getInventoryConditions,
  getInventoryCondition,
  createInventoryCondition,
  updateInventoryCondition,
  deleteInventoryCondition,
} from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

const useInventoyCatalogs = (dispatch) => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };

  const fetchInventoryTypes = useMutation({
    mutationFn: getInventoryTypes,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_TYPES', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryType = useMutation({
    mutationFn: getInventoryType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_TYPE', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createInventoryTypeMutation = useMutation({
    mutationFn: createInventoryType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryTypes');
      dispatch({ type: 'CREATE_INVENTORY_TYPE', payload: data });
      Notifies('success', 'Tipo de inventario creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el tipo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const updateInventoryTypeMutation = useMutation({
    mutationFn: updateInventoryType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryTypes');
      dispatch({ type: 'UPDATE_INVENTORY_TYPE', payload: data });
      Notifies('success', 'Tipo de inventario actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el tipo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const deleteInventoryTypeMutation = useMutation({
    mutationFn: deleteInventoryType,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryTypes');
      dispatch({ type: 'DELETE_INVENTORY_TYPE', payload: data.data });
      Notifies('success', 'Tipo de inventario eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el tipo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryBrands = useMutation({
    mutationFn: getInventoryBrands,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_BRANDS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryBrand = useMutation({
    mutationFn: getInventoryBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_BRAND', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createInventoryBrandMutation = useMutation({
    mutationFn: createInventoryBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryBrands');
      console.log('payload', data);
      dispatch({ type: 'CREATE_INVENTORY_BRAND', payload: data });
      Notifies('success', 'Marca de inventario creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear la marca del inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const updateInventoryBrandMutation = useMutation({
    mutationFn: updateInventoryBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryBrands');
      dispatch({ type: 'UPDATE_INVENTORY_BRAND', payload: data });
      Notifies('success', 'Marca de inventario actualizada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar la marca del inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const deleteInventoryBrandMutation = useMutation({
    mutationFn: deleteInventoryBrand,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryBrands');
      dispatch({ type: 'DELETE_INVENTORY_BRAND', payload: data.data });
      Notifies('success', 'Marca de inventario eliminada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar la marca del inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryModels = useMutation({
    mutationFn: getInventoryModels,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_MODELS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryModel = useMutation({
    mutationFn: getInventoryModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_MODEL', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createInventoryModelMutation = useMutation({
    mutationFn: createInventoryModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryModels');
      dispatch({ type: 'CREATE_INVENTORY_MODEL', payload: data });
      Notifies('success', 'Modelo de inventario creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el modelo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const updateInventoryModelMutation = useMutation({
    mutationFn: updateInventoryModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryModels');
      console.log(data);
      dispatch({ type: 'UPDATE_INVENTORY_MODEL', payload: data });
      Notifies('success', 'Modelo de inventario actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el modelo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const deleteInventoryModelMutation = useMutation({
    mutationFn: deleteInventoryModel,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryModels');
      dispatch({ type: 'DELETE_INVENTORY_MODEL', payload: data.data });
      Notifies('success', 'Modelo de inventario eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el modelo de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const createMultipleModelsMutation = useMutation({
    mutationFn: createMultipleModels,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryModels');
      dispatch({ type: 'CREATE_MULTIPLE_MODELS', payload: data });
      Notifies('success', 'Modelos de inventarios creados exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear los modelos de inventarios');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryConditions = useMutation({
    mutationFn: getInventoryConditions,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_CONDITIONS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const fetchInventoryCondition = useMutation({
    mutationFn: getInventoryCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORY_CONDITION', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createInventoryConditionMutation = useMutation({
    mutationFn: createInventoryCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryConditions');
      dispatch({ type: 'CREATE_INVENTORY_CONDITION', payload: data });
      Notifies('success', 'Condicion de inventario creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear la condicion de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const updateInventoryConditionMutation = useMutation({
    mutationFn: updateInventoryCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryConditions');
      dispatch({ type: 'UPDATE_INVENTORY_CONDITION', payload: data });
      Notifies('success', 'Condicion de inventario actualizada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar la condicion de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const deleteInventoryConditionMutation = useMutation({
    mutationFn: deleteInventoryCondition,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventoryConditions');
      dispatch({ type: 'DELETE_INVENTORY_CONDITION', payload: data.data });
      Notifies('success', 'Condicion de inventario eliminada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar la condicion de inventario');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchInventoryTypes: fetchInventoryTypes.mutate,
    fetchInventoryType: fetchInventoryType.mutate,
    createInventoryType: (values) => {
      return createInventoryTypeMutation.mutateAsync(values);
    },
    updateInventoryType: (values) => {
      return updateInventoryTypeMutation.mutateAsync(values);
    },
    deleteInventoryType: deleteInventoryTypeMutation.mutate,
    fetchInventoryBrands: fetchInventoryBrands.mutate,
    fetchInventoryBrand: fetchInventoryBrand.mutate,
    createInventoryBrand: (values) => {
      return createInventoryBrandMutation.mutateAsync(values);
    },
    updateInventoryBrand: (values) => {
      return updateInventoryBrandMutation.mutateAsync(values);
    },
    deleteInventoryBrand: deleteInventoryBrandMutation.mutate,
    fetchInventoryModels: fetchInventoryModels.mutate,
    fetchInventoryModel: fetchInventoryModel.mutate,
    createInventoryModel: (values) => {
      return createInventoryModelMutation.mutateAsync(values);
    },
    updateInventoryModel: (values) => {
      return updateInventoryModelMutation.mutateAsync(values);
    },
    deleteInventoryModel: deleteInventoryModelMutation.mutate,
    createMultipleModels: (values) => {
      return createMultipleModelsMutation.mutateAsync(values);
    },
    fetchInventoryConditions: fetchInventoryConditions.mutate,
    fetchInventoryCondition: fetchInventoryCondition.mutate,
    createInventoryCondition: (values) => {
      return createInventoryConditionMutation.mutateAsync(values);
    },
    updateInventoryCondition: (values) => {
      return updateInventoryConditionMutation.mutateAsync(values);
    },
    deleteInventoryCondition: deleteInventoryConditionMutation.mutate,
  };
};

export default useInventoyCatalogs;
