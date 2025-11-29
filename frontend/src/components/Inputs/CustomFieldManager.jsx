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

  // Ref to track previous currentCustomFields to detect deep changes
  const prevCurrentCustomFieldsRef = React.useRef(currentCustomFields);
  const prevPinnedFieldsRef = React.useRef(pinnedFields);

  useEffect(() => {
    // Check if currentCustomFields actually changed (deep comparison or length check)
    const hasCurrentFieldsChanged = JSON.stringify(prevCurrentCustomFieldsRef.current) !== JSON.stringify(currentCustomFields);
    
    // Check if custom field pins changed (not other pins like location, PO, etc.)
    const customFieldPinKeys = Object.keys(pinnedFields).filter(k => k === 'customFields_selected' || k.startsWith('customField_'));
    const prevCustomFieldPinKeys = Object.keys(prevPinnedFieldsRef.current).filter(k => k === 'customFields_selected' || k.startsWith('customField_'));
    const hasCustomFieldPinsChanged = JSON.stringify(customFieldPinKeys.sort()) !== JSON.stringify(prevCustomFieldPinKeys.sort()) ||
      customFieldPinKeys.some(k => JSON.stringify(pinnedFields[k]) !== JSON.stringify(prevPinnedFieldsRef.current[k]));
    
    if (hasCurrentFieldsChanged) {
       prevCurrentCustomFieldsRef.current = currentCustomFields;
    }
    
    if (hasCustomFieldPinsChanged || hasCurrentFieldsChanged) {
       prevPinnedFieldsRef.current = pinnedFields;
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
            pinnedFields.customFields_selected.forEach(f => {
                if (!processedIds.has(f.value)) {
                    mergedFields.push({ ...f, fieldValue: '' }); // Main pin doesn't enforce value
                    processedIds.add(f.value);
                }
            });
        }

        // 2. Add fields from Individual Pins (Field + Value)
        Object.keys(pinnedFields).forEach(key => {
            if (key.startsWith('customField_')) {
                const pinData = pinnedFields[key];
                // pinData should be { value, label, fieldValue }
                if (pinData && pinData.value && !processedIds.has(pinData.value)) {
                    mergedFields.push(pinData);
                    processedIds.add(pinData.value);
                }
            }
        });

        // 3. Process merged fields to set correct values
        mergedFields = mergedFields.map(field => {
           const individualPin = pinnedFields[`customField_${field.value}`];
           let finalValue = '';
           
           // Priority 1: Individual Pin Value
           if (individualPin && individualPin.fieldValue) {
             finalValue = individualPin.fieldValue;
           }
           
           // Priority 2: User Input (from initialFields which comes from currentCustomFields/currentFormValues)
           const existingInput = initialFields.find(f => f.value === field.value);
           if (existingInput && existingInput.fieldValue) {
               finalValue = existingInput.fieldValue;
           }
           
           // Priority 3: Preserve current selectedFields value if it exists (user typed it)
           // This is crucial when pinnedFields changes but currentCustomFields doesn't
           // We can't add selectedFields to deps, so we'll rely on initialFields (from currentFormValues)
           
           return {
             ...field,
             fieldValue: finalValue
           };
        });
        
        // 4. Add any other fields currently selected by user (that are not pinned)
        initialFields.forEach(field => {
          if (!processedIds.has(field.value)) {
            mergedFields.push(field);
          }
        });

        setSelectedFields(mergedFields);
        return;
    }

    // If currentCustomFields CHANGED, we should respect it (it's a reset or load)
    if (hasCurrentFieldsChanged) {
        setSelectedFields(initialFields);
        return;
    }

    // If only customFields catalog changed (not currentCustomFields), update labels only
    setSelectedFields(prevSelected => {
        return prevSelected.map(field => {
            if (field.label === 'Campo Desconocido' || !field.label) {
                const found = customFields.find(cf => cf.id === field.value);
                if (found) {
                    return { ...field, label: found.name };
                }
            }
            return field;
        });
    });

  }, [currentCustomFields, customFields, isPinMode, pinnedFields]);

  // Funciones para manejar pin de campos personalizados
  const handlePinCustomField = (fieldId, currentFields) => {
    // Find the specific field to pin
    const fieldToPin = currentFields.find(f => f.value === fieldId);
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
    const listToSave = selectedFields.map(f => ({ ...f, fieldValue: '' }));
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
        const response = await createCustomField({ name: selectedOption.label });
        // Handle response structure (it might be response.data or just response)
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

    const updatedFormikValues = [
      ...values[name],
      { id: selectedOption.value, value: '' },
    ];
    setFieldValue(name, updatedFormikValues);

    // If Main Pin is active, update it (add new field to list)
    if (isPinMode && pinnedFields.customFields_selected !== undefined) {
       const listToSave = updatedSelectedFields.map(f => ({ ...f, fieldValue: '' }));
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

  // Sincronizar selectedFields con Formik values
  useEffect(() => {
    const currentFormikValues = values[name] || [];
    const newFormikValues = selectedFields.map((field) => ({
      id: field.value,
      value: field.fieldValue || '',
    }));

    // Evitar actualizaciones innecesarias
    if (JSON.stringify(currentFormikValues) !== JSON.stringify(newFormikValues)) {
      setFieldValue(name, newFormikValues);
    }
  }, [selectedFields, name, setFieldValue, values[name]]);

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
