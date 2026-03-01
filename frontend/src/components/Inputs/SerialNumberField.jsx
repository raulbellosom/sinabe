import React, { useState } from 'react';
import { useFormikContext, ErrorMessage } from 'formik';
import { checkSerialNumber } from '../../services/api';
import classNames from 'classnames';
import PinnableInputWrapper from './PinnableInputWrapper';
import { Hash } from 'lucide-react';

const SerialNumberField = ({
  className,
  field,
  form = {},
  inventoryId,
  label,
  id,
  name,
  // Props del sistema de pin
  isPinMode = false,
  isPinned = false,
  onTogglePin,
  ...props
}) => {
  const { touched = {}, errors = {} } = form;
  const { setFieldError } = useFormikContext();
  const [error, setError] = useState(null);
  const hasError = (touched[field?.name] && errors[field?.name]) || error;

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
      } catch (err) {
        console.error('Error al validar el serial:', err);
      }
    }
  };

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
        <div
          className={classNames(
            'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
            hasError
              ? 'text-[color:var(--danger)]'
              : 'text-[color:var(--foreground-muted)]',
          )}
        >
          <Hash size={18} />
        </div>
        <input
          {...field}
          {...props}
          onBlur={handleBlur}
          className={classNames(
            'w-full min-h-[42px] text-sm py-2.5 px-3 pl-10 rounded-lg',
            'border bg-[color:var(--surface)] text-[color:var(--foreground)]',
            'placeholder:text-[color:var(--foreground-muted)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30 focus:border-[color:var(--danger)]'
              : 'border-[color:var(--border)] focus:ring-[color:var(--primary)]/30 focus:border-[color:var(--primary)]',
          )}
        />
      </div>
      {hasError && (
        <div className="text-[color:var(--danger)] text-sm mt-1">
          <ErrorMessage name={field?.name} component="span" />
          {error && !errors[field?.name] && <span>{error}</span>}
        </div>
      )}
    </PinnableInputWrapper>
  );
};

export default React.memo(SerialNumberField);
