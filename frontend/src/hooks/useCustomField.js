import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getCustomFieldValues,
  addCustomFieldValue,
} from '../services/api'; // Asegúrate de que la ruta esté correcta a tu archivo api.js
import Notifies from '../components/Notifies/Notifies';

// Hook personalizado para manejar los Custom Fields
const useCustomField = (dispatch) => {
  const queryClient = useQueryClient();

  // Obtener todos los custom fields
  const {
    data: customFields,
    isLoading: isLoadingCustomFields,
    error: customFieldsError,
  } = useQuery({
    queryKey: ['customFields'],
    queryFn: getCustomFields,
  });

  // Crear un nuevo custom field
  const createFieldMutation = useMutation({
    mutationFn: createCustomField, // Función que ejecuta la mutación
    onSuccess: () => {
      queryClient.invalidateQueries(['customFields']);
      Notifies('success', 'Campo personalizado creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', `Error al crear campo: ${error.message}`);
    },
  });

  // Actualizar un custom field
  const updateFieldMutation = useMutation({
    mutationFn: updateCustomField, // Función que ejecuta la mutación
    onSuccess: () => {
      queryClient.invalidateQueries(['customFields']);
      Notifies('success', 'Campo personalizado actualizado exitosamente');
    },
    onError: (error) => {
      Notifies('error', `Error al actualizar campo: ${error.message}`);
    },
  });

  // Eliminar un custom field
  const deleteFieldMutation = useMutation({
    mutationFn: deleteCustomField, // Función que ejecuta la mutación
    onSuccess: () => {
      queryClient.invalidateQueries(['customFields']);
      Notifies('success', 'Campo personalizado eliminado exitosamente');
    },
    onError: (error) => {
      Notifies('error', `Error al eliminar campo: ${error.message}`);
    },
  });

  // Obtener valores de un custom field específico
  const getFieldValues = (customFieldId, query) => {
    return useQuery({
      queryKey: ['customFieldValues', customFieldId, query],
      queryFn: () => getCustomFieldValues(customFieldId, query),
    });
  };

  // Agregar un valor a un custom field
  const addFieldValueMutation = useMutation({
    mutationFn: addCustomFieldValue, // Función que ejecuta la mutación
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'customFieldValues',
        variables.customFieldId,
      ]);
      Notifies('success', 'Valor de campo personalizado creado exitosamente');
    },
    onError: (error) => {
      Notifies('error', `Error al agregar valor al campo: ${error.message}`);
    },
  });

  return {
    // Datos y estados para obtener los custom fields
    customFields,
    isLoadingCustomFields,
    customFieldsError,
    getFieldValues,
    createField: (values) => createFieldMutation.mutateAsync(values),
    updateField: (values) => updateFieldMutation.mutateAsync(values),
    deleteField: (values) => deleteFieldMutation.mutateAsync(values),
    addFieldValue: (values) => addFieldValueMutation.mutateAsync(values),
  };
};

export default useCustomField;
