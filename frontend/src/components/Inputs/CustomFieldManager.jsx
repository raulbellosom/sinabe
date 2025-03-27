import React, { useState, useEffect } from 'react';
import Select from 'react-select/creatable';
import AsyncSelect from 'react-select/async-creatable';
import { useFormikContext } from 'formik';
import { getCustomFieldValues } from '../../services/api';
import { Label } from 'flowbite-react';
import Notifies from '../Notifies/Notifies';
import ActionButtons from '../ActionButtons/ActionButtons';
import { MdDelete } from 'react-icons/md';

const CustomFieldManager = ({
  name,
  customFields = [],
  createCustomField,
  currentCustomFields = [],
}) => {
  const { setFieldValue, values, errors } = useFormikContext();

  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    const initialFields = currentCustomFields.map((field) => ({
      value: field.customFieldId,
      label: field.name,
      fieldValue: field.value || '',
    }));
    setSelectedFields(initialFields);
  }, [currentCustomFields]);

  const handleCustomFieldSelect = async (selectedOption) => {
    if (selectedFields.some((field) => field.value === selectedOption.value)) {
      Notifies('error', 'Campo personalizado ya seleccionado');
      return;
    }

    if (selectedOption.__isNew__) {
      const response = await createCustomField({ name: selectedOption.label });
      selectedOption = { value: response.data.id, label: response.data.name };
    }

    const newField = {
      value: selectedOption.value,
      label: selectedOption.label,
      fieldValue: '',
    };
    setSelectedFields((prevFields) => [...prevFields, newField]);

    setFieldValue(name, [
      ...values[name],
      { id: selectedOption.value, value: '' },
    ]);
  };

  const loadFieldValues = async (inputValue, customFieldId) => {
    if (!customFieldId) return [];
    try {
      const response = await getCustomFieldValues({
        customFieldId,
        query: inputValue,
      });
      return response.map((value) => ({
        value: value,
        label: value,
      }));
    } catch (error) {
      console.error('Error loading field values:', error);
      return [];
    }
  };

  const handleValueChange = async (selectedValue, index) => {
    if (!selectedValue) return;

    const updatedFields = [...selectedFields];
    updatedFields[index].fieldValue = selectedValue.label;
    setSelectedFields(updatedFields);

    const updatedFormikValues = [...values[name]];
    updatedFormikValues[index].value = selectedValue.label;
    setFieldValue(name, updatedFormikValues);
  };

  const handleFieldRemove = (fieldValue) => {
    setSelectedFields((prevFields) =>
      prevFields.filter((field) => field.value !== fieldValue),
    );

    const updatedFields = values[name].filter((field) =>
      field?.customFieldId
        ? field.customFieldId !== fieldValue &&
          field.value !== '' &&
          field.value !== null
        : field.id !== fieldValue && field.value !== '' && field.value !== null,
    );

    setFieldValue(name, updatedFields);
  };

  return (
    <div className="w-full col-span-12 text-neutral-800 md:pb-24">
      <Label className="text-sm font-medium">Agregar Campo Personalizado</Label>
      <Select
        className="w-full border-neutral-500 border rounded-md"
        options={customFields.map((field) => ({
          value: field.id,
          label: field.name,
        }))}
        onChange={handleCustomFieldSelect}
        isClearable
        isCreatable
        placeholder="Selecciona o crea un campo"
      />

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2 2xl:gap-8 mt-2">
        {selectedFields.map((field, index) => (
          <div key={field.value} className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-sm font-medium">{field.label}</Label>
              <div className="flex items-center gap-4">
                <AsyncSelect
                  cacheOptions
                  loadOptions={(inputValue) =>
                    loadFieldValues(inputValue, field.value)
                  }
                  value={{ label: field.fieldValue, value: field.fieldValue }} // Asignamos el valor actual
                  onChange={(selectedValue) =>
                    handleValueChange(selectedValue, index)
                  }
                  isCreatable
                  placeholder="Selecciona o crea un valor"
                  className="w-full"
                />
                <div className="w-fit">
                  <ActionButtons
                    extraActions={[
                      {
                        action: () => handleFieldRemove(field.value),
                        color: 'red',
                        icon: MdDelete,
                        type: 'button',
                      },
                    ]}
                  />
                </div>
              </div>
              {errors.customFields && errors.customFields[index] && (
                <div className="text-red-500 text-xs">
                  {errors.customFields[index].value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFieldManager;
