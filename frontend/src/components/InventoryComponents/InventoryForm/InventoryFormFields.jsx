import React, { useState } from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import TextArea from '../../Inputs/TextArea';
import FileInput from '../../Inputs/FileInput';
import { MdInfo, MdCalendarToday } from 'react-icons/md';
import { IoLogoModelS } from 'react-icons/io';
import MultiSelectInput from '../../Inputs/MultiSelectInput';
import ImagePicker from '../../Inputs/ImagePicker';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { TbNumber123 } from 'react-icons/tb';
import AutoCompleteInput from '../../Inputs/AutoCompleteInput';

const InventoryFormFields = ({
  inventoryModels,
  inventoryConditions,
  onOtherSelected,
  customFields = [],
}) => {
  const [selectedCustomFields, setSelectedCustomFields] = useState([]);

  const handleCustomFieldSelection = (field) => {
    if (selectedCustomFields.some((f) => f.id === field.id)) {
      setSelectedCustomFields(
        selectedCustomFields.filter((f) => f.id !== field.id),
      );
    } else {
      setSelectedCustomFields([...selectedCustomFields, field]);
    }
  };

  const handleSelectCustomField = (field) => {
    handleCustomFieldSelection(field);
  };

  console.log(customFields)
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-0">
      <div className="col-span-12 lg:col-span-8 lg:w-[97%]">
        <div className="grid grid-cols-12 gap-2">
          <p
            style={{
              width: '100%',
              textAlign: 'center',
              borderBottom: '1px solid #e2e8f0',
              lineHeight: '0.1em',
              margin: '10px 0 20px',
            }}
            className="col-span-12 text-base font-semibold"
          >
            <span style={{ background: '#fff', padding: '0 10px' }}>
              Información General del Inventario
            </span>
          </p>
          <Field
            name="modelId"
            id="modelId"
            component={SelectInput}
            icon={IoLogoModelS}
            label="Modelo"
            options={inventoryModels.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            isOtherOption={true}
            onOtherSelected={onOtherSelected}
            className="col-span-12 md:col-span-8"
          />

          <Field
            name="serialNumber"
            id="serialNumber"
            component={TextInput}
            icon={TbNumber123}
            label="Número de Serie"
            className="col-span-6 md:col-span-4"
          />
          <Field
            name="activeNumber"
            id="activeNumber"
            component={TextInput}
            icon={AiOutlineFieldNumber}
            label="Número de Activo"
            className="col-span-6 md:col-span-4"
          />
          <Field
            name="receptionDate"
            id="receptionDate"
            component={DateInput}
            label="Fecha de Recepción"
            title="Fecha de Recepción"
            icon={MdCalendarToday}
            max={new Date().toISOString().split('T')[0]}
            className="col-span-6 md:col-span-4"
          />
          <Field
            name="status"
            id="status"
            component={SelectInput}
            icon={MdInfo}
            label="Estado"
            options={[
              { label: 'ALTA', value: 'ALTA' },
              { label: 'BAJA', value: 'BAJA' },
              { label: 'PROPUESTA DE BAJA', value: 'PROPUESTA' },
            ]}
            className="col-span-12 md:col-span-4"
          />

          <Field
            name="conditions"
            id="conditions"
            component={MultiSelectInput}
            icon={MdInfo}
            label="Condición del Inventario"
            options={inventoryConditions.map((condition) => ({
              label: condition.name,
              value: condition.id,
            }))}
            className="col-span-12"
          />
          <Field
            name="comments"
            id="comments"
            component={TextArea}
            label="Observaciones"
            className="col-span-12"
          />
          <p
            style={{
              width: '100%',
              textAlign: 'center',
              borderBottom: '1px solid #e2e8f0',
              lineHeight: '0.1em',
              margin: '10px 0 20px',
            }}
            className="col-span-12 text-base font-semibold pt-4"
          >
            <span style={{ background: '#fff', padding: '0 10px' }}>
              Información Adicional
            </span>
          </p>
          {/* aqui podria ser donde agregare un buscador para los customfields y cuando el usuario seleccione un customField se le debera desplegar un input en automatico que pertenecera al array de customFields*/}
          <Field
  name="customFieldSearch"
  component={AutoCompleteInput}
  label="Selecciona un campo personalizado"
  items={customFields.map((field) => ({
    id: field.id,
    title: field.name, // Cambiamos 'name' a 'title'
    subtitle: field.type, // Puedes usar 'type' como 'subtitle' si necesitas
  }))}
  onSelect={handleCustomFieldSelection}
  className="col-span-12"
/>
          {selectedCustomFields.length > 0 && (
            <div className="col-span-12">
              <FieldArray name="customFields">
                {() => (
                  <div>
                    {selectedCustomFields.map((field, index) => (
                      <div key={field.id} className="mb-4">
                        <Field
                          name={`customFields[${index}].value`}
                          component="input"
                          label={field.name}
                          placeholder={`Ingresa el valor para ${field.name}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FieldArray>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 h-full">
        <div className="w-full h-full">
          <Field
            name="images"
            id="images"
            component={ImagePicker}
            label="Imagenes"
            multiple
            accept="image/.png,.jpg,.jpeg"
          />
          <Field
            name="files"
            id="files"
            component={FileInput}
            label="Archivos"
            className="col-span-12"
            multiple
            helperText="PDF, Word, Excel, Imagenes, Rar, Zip"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.rar,.zip,.tar,.gz,.ppt,.pptx,.mp4,.avi,.mov,.json,.xml"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryFormFields;
