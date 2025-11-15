import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventories,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  searchInventories as searchInventoriesAPI,
  createMultipleInventories,
  getPurchaseOrdersList,
  getInvoicesList,
  createPurchaseOrderSimple,
  createInvoiceSimple,
} from '../services/api';
import {
  getInventoryLocationsList,
  createInventoryLocation,
} from '../services/inventoryLocationService';
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
      Notifies('error', error?.response?.data?.message);
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
      Notifies('error', error?.response?.data?.message);
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
      Notifies('error', error?.response?.data?.message);
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
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchPurchaseOrdersMutation = useMutation({
    mutationFn: getPurchaseOrdersList,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_PURCHASE_ORDERS_SUCCESS', payload: data });
    },
    onError: (error) => {
      Notifies('error', 'Error al cargar órdenes de compra');
    },
    onSettled: () => setLoading(false),
  });

  const fetchInvoicesMutation = useMutation({
    mutationFn: getInvoicesList,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_INVOICES_SUCCESS', payload: data });
    },
    onError: (error) => {
      Notifies('error', 'Error al cargar facturas');
    },
    onSettled: () => setLoading(false),
  });

  const createPurchaseOrderMutation = useMutation({
    mutationFn: createPurchaseOrderSimple,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'CREATE_PURCHASE_ORDER', payload: data });
      Notifies('success', 'Orden de compra creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear orden de compra');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoiceSimple,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'CREATE_INVOICE', payload: data });
      Notifies('success', 'Factura creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear factura');
      Notifies('error', error?.response?.data?.message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchLocationsMutation = useMutation({
    mutationFn: getInventoryLocationsList,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'FETCH_LOCATIONS_SUCCESS', payload: data });
    },
    onError: (error) => {
      Notifies('error', 'Error al cargar ubicaciones');
    },
    onSettled: () => setLoading(false),
  });

  const createLocationMutation = useMutation({
    mutationFn: createInventoryLocation,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      dispatch({ type: 'CREATE_LOCATION', payload: data });
      Notifies('success', 'Ubicación creada exitosamente');
    },
    onError: (error) => {
      Notifies('error', 'Error al crear ubicación');
      Notifies('error', error?.response?.data?.message);
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
    fetchPurchaseOrders: fetchPurchaseOrdersMutation.mutate,
    fetchInvoices: fetchInvoicesMutation.mutate,
    fetchLocations: fetchLocationsMutation.mutate,
    createPurchaseOrder: (values) => {
      return createPurchaseOrderMutation.mutateAsync(values);
    },
    createInvoice: (values) => {
      return createInvoiceMutation.mutateAsync(values);
    },
    createLocation: (values) => {
      return createLocationMutation.mutateAsync(values);
    },
  };
};

export default useInventoy;
