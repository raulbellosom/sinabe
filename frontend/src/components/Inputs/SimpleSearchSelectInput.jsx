import { useMemo } from 'react';
import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import Combobox from '../common/Combobox';
import Notifies from '../Notifies/Notifies';

const SimpleSearchSelectInput = ({
  field,
  form = {},
  closeMenuOnSelect = true,
  onSelect,
  className,
  isMulti = false,
  createOption = () => {},
  isClearable = false,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {}, setFieldValue = () => {} } = form;

  // Convert field value to selected option(s) format for Combobox
  const selectedValue = useMemo(() => {
    if (isMulti) {
      return props.options.filter((option) =>
        field.value?.includes(option.value),
      );
    }
    return props.options.find((option) => option.value === field.value) || null;
  }, [field.value, props.options, isMulti]);

  const handleCreateOption = async (inputValue) => {
    try {
      const response = await createOption({ name: inputValue });
      if (response?.id) {
        return { value: response.id, label: inputValue };
      }
      return { value: inputValue, label: inputValue, __isNew__: true };
    } catch (error) {
      Notifies('error', error?.response?.data?.message || 'Error al crear');
      console.error('Error al crear nuevo registro:', error);
      return null;
    }
  };

  const handleChange = async (selectedOption) => {
    try {
      if (isMulti) {
        const values = selectedOption
          ? selectedOption.map((opt) => opt.value)
          : [];
        setFieldValue(field?.name, values);
        if (onSelect) onSelect(values);
      } else {
        const value = selectedOption?.value;
        setFieldValue(field?.name, value);
        if (onSelect) onSelect(value);
      }
    } catch (error) {
      Notifies('error', error?.response?.data?.message);
      console.error('Error al seleccionar:', error);
    }
  };

  return (
    <div className={classNames('w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium"
        color={touched[field?.name] && errors[field?.name] ? 'failure' : ''}
        value={props.label}
      />
      <Combobox
        options={props.options}
        value={selectedValue}
        onChange={handleChange}
        isMulti={isMulti}
        isCreatable
        onCreateOption={handleCreateOption}
        closeMenuOnSelect={closeMenuOnSelect}
        placeholder="Selecciona o crea una opción"
        isClearable={isClearable}
        className="mt-1"
      />
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[var(--danger)] text-sm mt-1"
      />
    </div>
  );
};

export default SimpleSearchSelectInput;
