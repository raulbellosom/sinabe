import React from 'react';
import { ErrorMessage } from 'formik';
import { TextInput, Label } from 'flowbite-react';
import classNames from 'classnames';
import PinnableInputWrapper from './PinnableInputWrapper';

const DateInput = ({
  field,
  form = {},
  isPinMode,
  isPinned,
  onTogglePin,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {} } = form;
  const inputContent = (
    <>
      <TextInput
        type="date"
        lang="es-MX"
        placeholder="dd/mm/aaaa"
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        {...field}
        {...props}
        className={`mt-1`}
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
      <div className={classNames('w-full', props.className)}>
        <PinnableInputWrapper
          label={props.label}
          htmlFor={props.id || props.name}
          isPinned={isPinned}
          onTogglePin={() => onTogglePin(field.value)}
          error={touched[field?.name] && errors[field?.name]}
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
        className="block text-sm font-medium text-nowrap"
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />
      {inputContent}
    </div>
  );
};

export default DateInput;
