import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import PinnableInputWrapper from './PinnableInputWrapper';

const DateInput = ({
  field,
  form = {},
  isPinMode,
  isPinned,
  onTogglePin,
  icon: Icon,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {} } = form;
  const hasError = touched[field?.name] && errors[field?.name];

  const inputContent = (
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
        type="date"
        lang="es-MX"
        placeholder="dd/mm/aaaa"
        {...field}
        {...props}
        className={classNames(
          'w-full min-h-[42px] text-sm py-2.5 px-3 rounded-lg',
          'border bg-[color:var(--surface)] text-[color:var(--foreground)]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2',
          Icon && 'pl-10',
          hasError
            ? 'border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30 focus:border-[color:var(--danger)]'
            : 'border-[color:var(--border)] focus:ring-[color:var(--primary)]/30 focus:border-[color:var(--primary)]',
        )}
      />
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[color:var(--danger)] text-xs mt-1"
      />
    </div>
  );

  if (isPinMode) {
    return (
      <div className={classNames('w-full', props.className)}>
        <PinnableInputWrapper
          label={props.label}
          htmlFor={props.id || props.name}
          isPinned={isPinned}
          onTogglePin={() => onTogglePin(field.value)}
          error={hasError}
        >
          {inputContent}
        </PinnableInputWrapper>
      </div>
    );
  }

  return (
    <div className={classNames('w-full', props.className)}>
      <Label
        htmlFor={props.id || props.name}
        className={classNames('block text-sm font-medium mb-1.5 text-nowrap', {
          'text-[color:var(--danger)]': hasError,
        })}
        value={props.label}
      />
      {inputContent}
    </div>
  );
};

export default DateInput;
