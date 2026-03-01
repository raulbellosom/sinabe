import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import PinnableInputWrapper from './PinnableInputWrapper';

const TextArea = ({
  field,
  className,
  form = {},
  isPinMode,
  isPinned,
  onTogglePin,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {} } = form;
  const hasError = touched[field?.name] && errors[field?.name];

  const textareaContent = (
    <>
      <textarea
        {...field}
        {...props}
        className={classNames(
          'w-full min-h-[120px] text-sm py-2.5 px-3 rounded-lg resize-y',
          'border bg-[color:var(--surface)] text-[color:var(--foreground)]',
          'placeholder:text-[color:var(--foreground-muted)]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2',
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
    </>
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
          {textareaContent}
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
      {textareaContent}
    </div>
  );
};

export default TextArea;
