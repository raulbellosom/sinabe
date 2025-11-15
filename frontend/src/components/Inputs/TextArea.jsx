import React from 'react';
import { ErrorMessage } from 'formik';
import { Textarea as Area, Label } from 'flowbite-react';
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
  const textareaContent = (
    <>
      <Area
        {...field}
        {...props}
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        className="mt-1 min-h-44 md:min-h-28"
      />
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-red-500 text-sm"
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
          error={touched[field?.name] && errors[field?.name]}
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
        className={'block text-sm font-medium'}
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />
      {textareaContent}
    </div>
  );
};

export default TextArea;
