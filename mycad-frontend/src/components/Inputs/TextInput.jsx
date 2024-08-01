import React from 'react';
import { ErrorMessage } from 'formik';
import { TextInput as Input, Label } from 'flowbite-react';
import classNames from 'classnames';

const TextInput = ({
  className,
  field,
  form: { touched, errors },
  ...props
}) => (
  <div className={classNames('w-full', className)}>
    <Label
      htmlFor={props.id || props.name}
      className={'block text-sm font-medium'}
      color={touched[field.name] && errors[field.name] ? 'failure' : ''}
      value={props.label}
    />
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
