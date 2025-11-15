import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { checkSerialNumber } from '../../services/api';
import { ErrorMessage } from 'formik';
import { TextInput as Input, Label } from 'flowbite-react';
import classNames from 'classnames';

const SerialNumberField = ({
  className,
  field,
  form = {},
  inventoryId,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {} } = form;
  const { setFieldError } = useFormikContext();
  const [error, setError] = useState(null);
  const handleBlur = async (e) => {
    field.onBlur(e);
    const serial = e.target.value;

    if (serial) {
      try {
        const result = await checkSerialNumber(serial, inventoryId);
        if (result.exists) {
          setFieldError(field?.name, 'El número de serie ya existe');
          setError('El número de serie ya existe');
        } else {
          setError(null);
        }
      } catch (error) {
        console.error('Error al validar el serial:', error);
      }
    }
  };

  return (
    <div className={classNames('relative w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className={'block text-sm font-medium'}
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />
      <div className="relative">
        <Input
          {...field}
          {...props}
          color={
            (touched[field?.name] && errors[field?.name]) || error
              ? 'failure'
              : ''
          }
          className="mt-1 text-neutral-800"
          onBlur={handleBlur}
        />
      </div>
      <div className="text-red-500 text-sm">
        <ErrorMessage
          name={field?.name}
          component="div"
          className="text-red-500 text-sm"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default React.memo(SerialNumberField);
