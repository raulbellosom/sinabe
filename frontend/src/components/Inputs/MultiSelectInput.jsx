import { useMemo } from 'react';
import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import Combobox from '../common/Combobox';
import PinnableInputWrapper from './PinnableInputWrapper';

const MultiSelectInput = ({
  field,
  isOtherOption,
  onOtherSelected,
  className,
  closeMenuOnSelect = false,
  form = {},
  isPinMode,
  isPinned,
  onTogglePin,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {}, setFieldValue = () => {} } = form;

  // Prepare options with "Other" option if needed
  const allOptions = useMemo(
    () => [
      ...props.options,
      ...(isOtherOption ? [{ label: 'Otro', value: '0' }] : []),
    ],
    [props.options, isOtherOption],
  );

  // Convert field values to selected options format for Combobox
  const selectedOptions = useMemo(() => {
    return allOptions.filter((option) => field.value?.includes(option.value));
  }, [field.value, allOptions]);

  const handleChange = (selectedOpts) => {
    const values = selectedOpts
      ? selectedOpts.map((option) => option.value)
      : [];
    setFieldValue(field?.name, values);

    if (values.includes('0') && onOtherSelected && isOtherOption) {
      onOtherSelected();
    }
  };

  const selectContent = (
    <>
      <Combobox
        options={allOptions}
        value={selectedOptions}
        onChange={handleChange}
        isMulti
        closeMenuOnSelect={closeMenuOnSelect}
        placeholder={props.placeholder || 'Seleccionar...'}
        isClearable
        className="mt-1"
      />
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[var(--danger)] text-sm mt-1"
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

export default MultiSelectInput;
