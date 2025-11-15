import React, { useState } from 'react';
import { TextInput as Input } from 'flowbite-react';
import classNames from 'classnames';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PinnableInputWrapper from './PinnableInputWrapper';

const TextInput = ({
  className,
  field,
  form,
  // Props del sistema de pin
  isPinMode = false,
  isPinned = false,
  onTogglePin,
  label,
  id,
  name,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { touched, errors } = form;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType =
    props.type === 'password' && showPassword ? 'text' : props.type;

  return (
    <PinnableInputWrapper
      className={className}
      field={field}
      form={form}
      label={label}
      id={id}
      name={name}
      isPinMode={isPinMode}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="relative">
        <Input
          {...field}
          {...props}
          type={inputType}
          color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
          className="text-neutral-800"
        />
        {props.type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        )}
      </div>
    </PinnableInputWrapper>
  );
};

export default React.memo(TextInput);
