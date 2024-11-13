import React from 'react';
import AsyncSelect from 'react-select/async-creatable';

const AutoCompleteInput = ({
  label,
  loadSuggestions,
  field,
  form,
  ...props
}) => {
  const handleChange = (selectedOption) => {
    const value = selectedOption
      ? {
          id: field.name,
          customFieldId: props.id,
          value: selectedOption.value,
        }
      : undefined;

    form.setFieldValue(field.name, value);
  };
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadSuggestions}
        onChange={handleChange}
        placeholder="Selecciona una opción"
        allowCreateWhileLoading={true}
        value={
          field.value
            ? { label: field.value.value, value: field.value.value }
            : null
        }
        {...props}
      />
    </div>
  );
};

export default AutoCompleteInput;
