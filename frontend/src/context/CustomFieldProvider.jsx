import React, { useReducer } from 'react';
import CustomFieldContext from './CustomFieldContext';
import customFieldReducer from './CustomFieldReducer';
import useCustomField from '../hooks/useCustomField';

const CustomFieldProvider = ({ children }) => {
  const initialState = {
    customFields: [],
    customFieldValues: [],
  };

  const [state, dispatch] = useReducer(customFieldReducer, initialState);
  const {
    customFields,
    isLoadingCustomFields,
    customFieldsError,
    createField,
    updateField,
    deleteField,
    getFieldValues,
    addFieldValue,
  } = useCustomField(dispatch);

  // Actualizar estado cuando los campos personalizados están cargados
  React.useEffect(() => {
    if (customFields) {
      dispatch({ type: 'SET_CUSTOM_FIELDS', payload: customFields });
    }
  }, [customFields]);

  return (
    <CustomFieldContext.Provider
      value={{
        ...state,
        isLoadingCustomFields,
        customFieldsError,
        createField,
        updateField,
        deleteField,
        getFieldValues,
        addFieldValue,
      }}
    >
      {children}
    </CustomFieldContext.Provider>
  );
};

export default CustomFieldProvider;
