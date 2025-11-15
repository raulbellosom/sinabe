import React, { useState, useEffect } from 'react';
import Select from 'react-select/creatable';
import AsyncSelect from 'react-select/async-creatable';
import { useFormikContext } from 'formik';
import { getCustomFieldValues } from '../../services/api';
import { Label } from 'flowbite-react';
import Notifies from '../Notifies/Notifies';
import ActionButtons from '../ActionButtons/ActionButtons';
import { MdDelete } from 'react-icons/md';
import PinIcon from '../PinIcon/PinIcon';

const CustomFieldManager = ({
  name,
  customFields = [],
  createCustomField,
  currentCustomFields = [],
  // Props del sistema de pin
  isPinMode = false,
  pinnedFields = {},
  onPinField,
  onUnpinField,
  formikValues = {},
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

  // useEffect para cargar campos pineados
  useEffect(() => {
    // Cargar campos personalizados seleccionados pineados
    if (pinnedFields.customFields_selected) {
      setSelectedFields(pinnedFields.customFields_selected);
    }

    // Cargar valores individuales pineados
    Object.keys(pinnedFields).forEach((key) => {
      if (key.startsWith('customField_')) {
        const fieldData = pinnedFields[key];
        if (fieldData && fieldData.selectedFields) {
          // Merge con los campos actuales si es necesario
          setSelectedFields((prevFields) => {
            const existingFieldIds = prevFields.map((f) => f.value);
            const newFields = fieldData.selectedFields.filter(
              (f) => !existingFieldIds.includes(f.value),
            );
            return [...prevFields, ...newFields];
          });
        }
      }
    });
  }, [pinnedFields]);

  // Funciones para manejar pin de campos personalizados
  const handlePinCustomField = (fieldId, currentFields) => {
    const pinnedData = {
      selectedFields: currentFields,
      formikValues: values[name],
    };
    onPinField(`customField_${fieldId}`, pinnedData);
  };

  const handleUnpinCustomField = (fieldId) => {
    onUnpinField(`customField_${fieldId}`);
  };

  // Función para pinear los campos personalizados seleccionados
  const handlePinSelectedFields = () => {
    onPinField('customFields_selected', selectedFields);
  };

  const handleUnpinSelectedFields = () => {
    onUnpinField('customFields_selected');
  };

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

    const updatedSelectedFields = [...selectedFields, newField];
    setSelectedFields(updatedSelectedFields);

    const updatedFormikValues = [
      ...values[name],
      { id: selectedOption.value, value: '' },
    ];
    setFieldValue(name, updatedFormikValues);

    // Si está en modo pin, actualizar el pin con los nuevos campos
    if (isPinMode && pinnedFields.customFields_selected !== undefined) {
      onPinField('customFields_selected', updatedSelectedFields);
    }
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

    // Si este campo específico está pineado, actualizar el pin
    const fieldId = selectedFields[index].value;
    if (isPinMode && pinnedFields[`customField_${fieldId}`] !== undefined) {
      handlePinCustomField(fieldId, updatedFields);
    }

    // Si los campos seleccionados están pineados, actualizar el pin general
    if (isPinMode && pinnedFields.customFields_selected !== undefined) {
      onPinField('customFields_selected', updatedFields);
    }
  };

  const handleFieldRemove = (fieldValue) => {
    const updatedSelectedFields = selectedFields.filter(
      (field) => field.value !== fieldValue,
    );
    setSelectedFields(updatedSelectedFields);

    const updatedFields = values[name].filter((field) =>
      field?.customFieldId
        ? field.customFieldId !== fieldValue &&
          field.value !== '' &&
          field.value !== null
        : field.id !== fieldValue && field.value !== '' && field.value !== null,
    );

    setFieldValue(name, updatedFields);

    // Remover pin específico si existe
    if (pinnedFields[`customField_${fieldValue}`] !== undefined) {
      handleUnpinCustomField(fieldValue);
    }

    // Actualizar pin general si existe
    if (isPinMode && pinnedFields.customFields_selected !== undefined) {
      onPinField('customFields_selected', updatedSelectedFields);
    }
  };

  return (
    <div className="w-full col-span-12 text-neutral-800 md:pb-24">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">
          Agregar Campo Personalizado
        </Label>
        <PinIcon
          isPinned={pinnedFields.customFields_selected !== undefined}
          onToggle={() => {
            if (pinnedFields.customFields_selected !== undefined) {
              handleUnpinSelectedFields();
            } else {
              handlePinSelectedFields();
            }
          }}
          isPinMode={isPinMode}
        />
      </div>
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
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm font-medium">{field.label}</Label>
                <PinIcon
                  isPinned={
                    pinnedFields[`customField_${field.value}`] !== undefined
                  }
                  onToggle={() => {
                    if (
                      pinnedFields[`customField_${field.value}`] !== undefined
                    ) {
                      handleUnpinCustomField(field.value);
                    } else {
                      handlePinCustomField(field.value, selectedFields);
                    }
                  }}
                  isPinMode={isPinMode}
                />
              </div>
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
