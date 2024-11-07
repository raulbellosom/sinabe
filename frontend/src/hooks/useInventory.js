import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventories,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories as searchInventoriesAPI,
  createMultipleInventories,
} from '../services/api';
import { useLoading } from '../context/LoadingContext';
import Notifies from '../components/Notifies/Notifies';

const useInventoy = (dispatch) => {
  const queryClient = useQueryClient();
  const { dispatch: loadingDispatch } = useLoading();

  const setLoading = (loading) => {
    loadingDispatch({ type: 'SET_LOADING', payload: loading });
  };

  const fetchInventories = useMutation({
    mutationFn: getInventories,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVENTORIES_SUCCESS', payload: data });
    },
    onSettled: () => setLoading(false),
  });

  const createInventoryMutation = useMutation({
    mutationFn: createInventory,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventories');
      dispatch({ type: 'CREATE_INVENTORY', payload: data });
      Notifies('success', 'Inventario creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear el inventario');
    },
    onSettled: () => setLoading(false),
  });

  const createMultipleInventoriesMutation = useMutation({
    mutationFn: createMultipleInventories,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventories');
      dispatch({ type: 'CREATE_MULTIPLE_INVENTORIES', payload: data });
      Notifies('success', 'Inventarios creados exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear los inventarios');
      return error;
    },
    onSettled: () => setLoading(false),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: updateInventory,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventories');
      dispatch({ type: 'UPDATE_INVENTORY', payload: data });
      Notifies('success', 'Inventario actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al actualizar el inventario');
    },
    onSettled: () => setLoading(false),
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: deleteInventory,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries('inventories');
      dispatch({ type: 'DELETE_INVENTORY', payload: data.data });
      Notifies('success', 'Inventario eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al eliminar el inventario');
    },
    onSettled: () => setLoading(false),
  });

  return {
    fetchInventories: fetchInventories.mutate,
    createInventory: (values) => {
      return createInventoryMutation.mutateAsync(values);
    },
    createMultipleInventories: (values) => {
      return createMultipleInventoriesMutation.mutateAsync(values);
    },
    updateInventory: (values) => {
      return updateInventoryMutation.mutateAsync(values);
    },
    deleteInventory: deleteInventoryMutation.mutate,
  };
};

export default useInventoy;
