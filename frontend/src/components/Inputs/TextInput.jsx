import React, { useState } from 'react';
import classNames from 'classnames';
import { Eye, EyeOff } from 'lucide-react';
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
  icon: Icon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { touched, errors } = form;
  const hasError = touched[field?.name] && errors[field?.name];

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
        {Icon && (
          <div
            className={classNames(
              'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
              hasError
                ? 'text-[color:var(--danger)]'
                : 'text-[color:var(--foreground-muted)]',
            )}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          {...field}
          {...props}
          type={inputType}
          className={classNames(
            'w-full min-h-[42px] text-sm py-2.5 px-3 rounded-lg',
            'border bg-[color:var(--surface)] text-[color:var(--foreground)]',
            'placeholder:text-[color:var(--foreground-muted)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            Icon && 'pl-10',
            props.type === 'password' && 'pr-10',
            hasError
              ? 'border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30 focus:border-[color:var(--danger)]'
              : 'border-[color:var(--border)] focus:ring-[color:var(--primary)]/30 focus:border-[color:var(--primary)]',
          )}
        />
        {props.type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </PinnableInputWrapper>
  );
};

export default React.memo(TextInput);
