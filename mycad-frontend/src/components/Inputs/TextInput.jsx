import React from 'react';
import { ErrorMessage } from 'formik';
import { TextInput as Input, Label } from 'flowbite-react';

const TextInput = ({ field, form: { touched, errors }, ...props }) => (
  <div className="w-full">
    <Label
      htmlFor={props.id || props.name}
      className={'block text-sm font-medium'}
      color={touched[field.name] && errors[field.name] ? 'failure' : ''}
    >
      {props.label}
    </Label>
    <Input
      {...field}
      {...props}
      color={touched[field.name] && errors[field.name] ? 'failure' : ''}
      className="mt-1"
    />
    <ErrorMessage
      name={field.name}
      component="div"
      className="text-red-500 text-sm"
    />
  </div>
);

export default TextInput;
