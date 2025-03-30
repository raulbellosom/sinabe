// SerialNumberField.jsx
import React from 'react';
import { useField, useFormikContext } from 'formik';
import { checkSerialNumber } from '../../services/api';
import TextInput from './TextInput';
import classNames from 'classnames';

const SerialNumberField = ({ inventoryId, ...props }) => {
  const [field] = useField(props?.field?.name);
  const { setFieldError } = useFormikContext();

  const handleBlur = async (e) => {
    field.onBlur(e);
    const serial = e.target.value;

    if (serial) {
      try {
        const result = await checkSerialNumber(serial, inventoryId);
        console.log(result);
        if (result.exists) {
          setFieldError(props?.field?.name, 'El número de serie ya existe');
        }
      } catch (error) {
        console.error('Error al validar el serial:', error);
      }
    }
  };

  return <TextInput {...field} {...props} onBlur={handleBlur} />;
};

export default React.memo(SerialNumberField);
