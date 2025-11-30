import React, { useState, useEffect, useRef } from 'react';
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
  const prevCurrentCustomFieldsRef = useRef([]);
  const prevCustomFieldsRef = useRef([]);

  useEffect(() => {
    // Check if currentCustomFields or customFields actually changed
    const currentFieldsChanged =
      JSON.stringify(prevCurrentCustomFieldsRef.current) !==
      JSON.stringify(currentCustomFields);

    const catalogChanged =
      JSON.stringify(prevCustomFieldsRef.current) !==
      JSON.stringify(customFields);

    // Update refs
    if (currentFieldsChanged) {
      prevCurrentCustomFieldsRef.current = currentCustomFields;
    }
    if (catalogChanged) {
      prevCustomFieldsRef.current = customFields;
    }

    // Map currentCustomFields (from parent/initialValues)
    const initialFields = currentCustomFields.map((field) => {
      const id = field.customFieldId || field.id;
      let name = field.name;
      let value = field.value || '';

      if (!name && id) {
        const foundField = customFields.find((cf) => cf.id === id);
        if (foundField) {
          name = foundField.name;
        }
      }

      return {
        value: id,
        label: name || 'Campo Desconocido',
        fieldValue: value,
      };
    });

    // If Pin Mode is active
    if (isPinMode) {
      let mergedFields = [];
      const processedIds = new Set();

      // 1. Add fields from Main Pin (List only)
      if (pinnedFields.customFields_selected) {
        pinnedFields.customFields_selected.forEach((f) => {
          if (!processedIds.has(f.value)) {
            mergedFields.push({ ...f, fieldValue: '' });
            processedIds.add(f.value);
          }
        });
      }

      // 2. Add fields from Individual Pins (Field + Value)
      Object.keys(pinnedFields).forEach((key) => {
        if (key.startsWith('customField_')) {
          const pinData = pinnedFields[key];
          if (pinData && pinData.value && !processedIds.has(pinData.value)) {
            mergedFields.push(pinData);
            processedIds.add(pinData.value);
          }
        }
      });

      // 3. Set correct values for merged fields
      mergedFields = mergedFields.map((field) => {
        const individualPin = pinnedFields[`customField_${field.value}`];
        let finalValue = '';

        // Priority 1: Individual Pin Value
        if (individualPin && individualPin.fieldValue) {
          finalValue = individualPin.fieldValue;
        }

        // Priority 2: User Input (from initialFields)
        const existingInput = initialFields.find(
          (f) => f.value === field.value,
        );
        if (!finalValue && existingInput && existingInput.fieldValue) {
          finalValue = existingInput.fieldValue;
        }

        // Priority 3: Current Formik value
        if (!finalValue) {
          const currentFormikValue = values[name]?.find(
            (v) => v.id === field.value || v.customFieldId === field.value,
          );
          if (currentFormikValue && currentFormikValue.value) {
            finalValue = currentFormikValue.value;
          }
        }

        return {
          ...field,
          fieldValue: finalValue,
        };
      });

      // 4. Add unpinned fields from initialFields and Formik values
      initialFields.forEach((field) => {
        if (!processedIds.has(field.value)) {
          mergedFields.push(field);
          processedIds.add(field.value);
        }
      });

      if (values[name]) {
        values[name].forEach((v) => {
          const id = v.id || v.customFieldId;
          if (!processedIds.has(id)) {
            let label = 'Campo Desconocido';
            const catalogField = customFields.find((cf) => cf.id === id);
            if (catalogField) {
              label = catalogField.name;
            }

            mergedFields.push({
              value: id,
              label: label,
              fieldValue: v.value || '',
            });
            processedIds.add(id);
          }
        });
      }

      setSelectedFields(mergedFields);
    } else {
      // No pin mode - use initialFields when there are actual changes
      if (
        currentFieldsChanged ||
        catalogChanged ||
        selectedFields.length === 0
      ) {
        setSelectedFields(initialFields);
      }
    }
  }, [
    currentCustomFields,
    customFields,
    isPinMode,
    pinnedFields,
    values,
    name,
  ]);

  // Funciones para manejar pin de campos personalizados
  const handlePinCustomField = (fieldId, currentFields) => {
    // Find the specific field to pin
    const fieldToPin = currentFields.find((f) => f.value === fieldId);
    if (fieldToPin) {
      onPinField(`customField_${fieldId}`, fieldToPin);
    }
  };

  const handleUnpinCustomField = (fieldId) => {
    onUnpinField(`customField_${fieldId}`);
  };

  // Función para pinear los campos personalizados seleccionados
  const handlePinSelectedFields = () => {
    // Main Pin: Save list only (strip values to avoid confusion)
    const listToSave = selectedFields.map((f) => ({ ...f, fieldValue: '' }));
    onPinField('customFields_selected', listToSave);
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
      try {
        const response = await createCustomField({
          name: selectedOption.label,
        });
        const newFieldData = response?.data || response;
        if (!newFieldData || !newFieldData.id) {
          throw new Error('Invalid response from createCustomField');
        }
        selectedOption = { value: newFieldData.id, label: newFieldData.name };
      } catch (error) {
        console.error('Error creating custom field:', error);
        Notifies('error', 'Error al crear el campo personalizado');
        return;
      }
    }

    const newField = {
      value: selectedOption.value,
      label: selectedOption.label,
      fieldValue: '',
    };

    const updatedSelectedFields = [...selectedFields, newField];
    setSelectedFields(updatedSelectedFields);

    const currentFormikValues = values[name] || [];
    const updatedFormikValues = [
      ...currentFormikValues,
      {
        id: selectedOption.value,
        value: '',
        customFieldId: selectedOption.value,
      },
    ];
    setFieldValue(name, updatedFormikValues);

    // If Main Pin is active, update it (add new field to list)
    if (isPinMode && pinnedFields.customFields_selected !== undefined) {
      const listToSave = updatedSelectedFields.map((f) => ({
        ...f,
        fieldValue: '',
      }));
      onPinField('customFields_selected', listToSave);
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

    // If Individual Pin is active, update it with new value
    const fieldId = selectedFields[index].value;
    if (isPinMode && pinnedFields[`customField_${fieldId}`] !== undefined) {
      handlePinCustomField(fieldId, updatedFields);
    }

    // DO NOT update Main Pin here (it only cares about the list)
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
        value={null}
        isClearable
        isCreatable
        placeholder="Selecciona o crea un campo"
        isOptionDisabled={(option) =>
          selectedFields.some((field) => field.value === option.value)
        }
      />

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2 mt-2">
        {selectedFields.map((field, index) => (
          <div
            key={`${field.value}-${index}`}
            className="flex items-center gap-2"
          >
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
                  value={{ label: field.fieldValue, value: field.fieldValue }}
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
