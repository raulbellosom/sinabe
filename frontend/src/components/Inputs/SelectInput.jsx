import React from 'react';
import { ErrorMessage } from 'formik';
import { Label, Select } from 'flowbite-react';
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
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {}, setFieldValue = () => {} } = form;
  const selectContent = (
    <>
      <Select
        {...field}
        {...props}
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        className="mt-1"
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
      </Select>
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
          {selectContent}
        </PinnableInputWrapper>
      </div>
    );
  }

  return (
    <div className={classNames('w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium"
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />
      {selectContent}
    </div>
  );
};

export default SelectInput;
