import React from 'react';
import { ErrorMessage } from 'formik';
import { Label, Select } from 'flowbite-react';

const SelectInput = ({ field, form: { touched, errors }, ...props }) => (
  <div className="w-full">
    <Label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium"
      color={touched[field.name] && errors[field.name] ? 'failure' : ''}
    >
      {props.label}
    </Label>
    <Select
      {...field}
      {...props}
      color={touched[field.name] && errors[field.name] ? 'failure' : ''}
      className="mt-1"
    >
      <option value="">Seleccione una opción</option>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
    <ErrorMessage
      name={field.name}
      component="div"
      className="text-red-500 text-sm"
    />
  </div>
);

export default SelectInput;
