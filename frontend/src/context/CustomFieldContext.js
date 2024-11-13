import { createContext, useContext } from 'react';

const CustomFieldContext = createContext({
  customFields: [],
  customFieldValues: [],
  isLoadingCustomFields: () => {},
  customFieldsError: () => {},
  getFieldValues: async () => {},
  createField: async () => {},
  updateField: async () => {},
  deleteField: async () => {},
  addFieldValue: async () => {},
});

export const useCustomFieldContext = () => {
  const context = useContext(CustomFieldContext);
  if (!context) {
    throw new Error(
      'useCustomFieldContext debe ser utilizado dentro de un CustomFieldProvider',
    );
  }
  return context;
};

export default CustomFieldContext;
