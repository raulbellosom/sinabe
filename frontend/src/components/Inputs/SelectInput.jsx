import { ErrorMessage } from 'formik';
import { Label } from '../ui/flowbite';
import classNames from 'classnames';
import PinnableInputWrapper from './PinnableInputWrapper';

const SelectInput = ({
  field,
  isOtherOption,
  onOtherSelected,
  className,
  form = {},
  isPinMode,
  isPinned,
  onTogglePin,
  icon: Icon,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {}, setFieldValue = () => {} } = form;
  const hasError = touched[field?.name] && errors[field?.name];

  const selectContent = (
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
      <select
        {...field}
        {...props}
        className={classNames(
          'w-full min-h-[42px] text-sm py-2.5 px-3 rounded-lg appearance-none cursor-pointer',
          'border bg-[color:var(--surface)] text-[color:var(--foreground)]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2',
          Icon && 'pl-10',
          'pr-10', // Space for chevron
          hasError
            ? 'border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30 focus:border-[color:var(--danger)]'
            : 'border-[color:var(--border)] focus:ring-[color:var(--primary)]/30 focus:border-[color:var(--primary)]',
        )}
        onChange={(e) => {
          const value = e.target.value;
          setFieldValue(field?.name, value);
          if (value === '0' && onOtherSelected && isOtherOption) {
            onOtherSelected();
          }
        }}
      >
        <option disabled value="">
          Seleccione una opción
        </option>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {isOtherOption && <option value="0">Otro</option>}
      </select>
      {/* Custom chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--foreground-muted)]">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[color:var(--danger)] text-xs mt-1"
      />
    </div>
  );

  if (isPinMode) {
    return (
      <div className={classNames('w-full', className)}>
        <PinnableInputWrapper
          label={props.label}
          htmlFor={props.id || props.name}
          isPinned={isPinned}
          onTogglePin={() => onTogglePin(field.value)}
          error={hasError}
        >
          {selectContent}
        </PinnableInputWrapper>
      </div>
    );
  }

  return (
    <div className={classNames('w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className={classNames('block text-sm font-medium mb-1.5', {
          'text-[color:var(--danger)]': hasError,
        })}
        value={props.label}
      />
      {selectContent}
    </div>
  );
};

export default SelectInput;
