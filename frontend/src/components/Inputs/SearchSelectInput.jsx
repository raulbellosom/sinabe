import { useMemo } from 'react';
import { ErrorMessage } from 'formik';
import { Label } from 'flowbite-react';
import classNames from 'classnames';
import Combobox from '../common/Combobox';

const SearchSelectInput = ({
  field,
  form = {},
  closeMenuOnSelect = false,
  onSelect,
  className,
  ...props
}) => {
  // Provide defaults for form properties
  const { touched = {}, errors = {}, setFieldValue = () => {} } = form;

  // Convert field values to selected options format for Combobox
  const selectedOptions = useMemo(() => {
    return props.options.filter((option) =>
      field.value?.includes(option.value),
    );
  }, [field.value, props.options]);

  const handleChange = (selectedOpts) => {
    const values = selectedOpts
      ? selectedOpts.map((option) => option.value)
      : [];

    setFieldValue(field?.name, values);

    if (onSelect && selectedOpts) {
      selectedOpts.forEach((option) => {
        onSelect(option);
      });
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
        value={selectedOptions}
        onChange={handleChange}
        isMulti
        isCreatable
        closeMenuOnSelect={closeMenuOnSelect}
        placeholder="Selecciona una opción"
        className="mt-1"
        isClearable
      />
      <ErrorMessage
        name={field?.name || ''}
        component="div"
        className="text-[var(--danger)] text-sm mt-1"
      />
    </div>
  );
};

export default SearchSelectInput;
