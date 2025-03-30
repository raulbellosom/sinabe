import React from 'react';
import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import CreatableSelect from 'react-select/creatable';
import Notifies from '../Notifies/Notifies';

const SimpleSearchSelectInput = ({
  field,
  form: { touched, errors, setFieldValue },
  closeMenuOnSelect = true,
  onSelect,
  className,
  isMulti = false,
  createOption = () => {},
  isClearable = false,
  ...props
}) => {
  const selectedValue = isMulti
    ? props.options.filter((option) => field.value?.includes(option.value))
    : props.options.find((option) => option.value === field.value);

  const handleChange = (selectedOption) => {
    try {
      const value = isMulti
        ? selectedOption.map((option) => option.value)
        : selectedOption?.value;

      if (selectedOption?.__isNew__) {
        createOption({ name: selectedOption.value }).then((response) => {
          setFieldValue(field.name, response.id);
        });
        return;
      }
      setFieldValue(field.name, value);
      if (onSelect) {
        onSelect(value);
      }
    } catch (error) {
      Notifies('error', error?.response?.data?.message);
      console.error('Error al crear nuevo registro:', error);
    }
  };

  return (
    <div className={classNames('w-full', className)}>
      <Label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium"
        color={touched[field.name] && errors[field.name] ? 'failure' : ''}
        value={props.label}
      />
      <CreatableSelect
        {...props}
        isMulti={isMulti}
        className="mt-1 border border-neutral-500 rounded-lg"
        closeMenuOnSelect={closeMenuOnSelect}
        placeholder="Selecciona o crea una opción"
        classNamePrefix="react-select"
        value={selectedValue}
        onChange={handleChange}
        options={props.options}
      />
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default SimpleSearchSelectInput;
