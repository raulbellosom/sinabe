import React from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import PinnableInputWrapper from '../../Inputs/PinnableInputWrapper';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import TextArea from '../../Inputs/TextArea';
import FileInput from '../../Inputs/FileInput';
import { MdInfo, MdCalendarToday } from 'react-icons/md';
import MultiSelectInput from '../../Inputs/MultiSelectInput';
import ImagePicker from '../../Inputs/ImagePicker';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { TbNumber123 } from 'react-icons/tb';
import CustomFieldManager from '../../Inputs/CustomFieldManager';
import AutocompleteInput from '../../Inputs/AutoCompleteInput';
import { HiCubeTransparent } from 'react-icons/hi';
import { FaClipboardList, FaFileInvoice, FaMapMarkerAlt } from 'react-icons/fa';
import SerialNumberField from '../../Inputs/SerialNumberField';

const InventoryFormFields = ({
  inventoryModels,
  inventoryConditions,
  customFields,
  createCustomField,
  currentCustomFields,
  inventoryId,
  onOtherSelected,
  onOtherPurchaseOrderSelected,
  onOtherInvoiceSelected,
  onOtherLocationSelected,
  purchaseOrders = [],
  invoices = [],
  locations = [],
  // Props del sistema de pin
  isPinMode = false,
  pinnedFields = {},
  onPinField,
  onUnpinField,
  formikValues = {},
}) => {
  // Función helper para crear wrappers con pin
  const createPinnableField = (fieldName, label, component, props = {}) => (
    <Field name={fieldName}>
      {({ field, form }) => (
        <PinnableInputWrapper
          field={field}
          form={form}
          label={label}
          isPinMode={isPinMode}
          isPinned={pinnedFields[fieldName] !== undefined}
          onTogglePin={() => {
            if (pinnedFields[fieldName] !== undefined) {
              onUnpinField(fieldName);
            } else {
              onPinField(fieldName, formikValues[fieldName]);
            }
          }}
        >
          {React.createElement(component, {
            ...field,
            ...props,
            id: fieldName,
          })}
        </PinnableInputWrapper>
      )}
    </Field>
  );
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-4">
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
            className="col-span-12 text-sm md:text-base font-semibold"
          >
            <span style={{ background: '#fff', padding: '0 10px' }}>
              Información General del Inventario
            </span>
          </p>
          <div className="col-span-12 md:col-span-8">
            <Field name="modelId">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="* Modelo"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.modelId !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.modelId !== undefined) {
                      onUnpinField('modelId');
                    } else {
                      onPinField('modelId', formikValues.modelId);
                    }
                  }}
                >
                  <AutocompleteInput
                    {...field}
                    id="modelId"
                    icon={HiCubeTransparent}
                    options={(inventoryModels || []).map((model) => ({
                      label: model?.name || '',
                      value: model?.id || '',
                    }))}
                    isClearable
                    allowOther
                    onOtherSelected={onOtherSelected}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field name="status">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="* Estado"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.status !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.status !== undefined) {
                      onUnpinField('status');
                    } else {
                      onPinField('status', formikValues.status);
                    }
                  }}
                >
                  <SelectInput
                    {...field}
                    id="status"
                    icon={MdInfo}
                    options={[
                      { label: 'ALTA', value: 'ALTA' },
                      { label: 'BAJA', value: 'BAJA' },
                      { label: 'PROPUESTA DE BAJA', value: 'PROPUESTA' },
                    ]}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field name="purchaseOrderId">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Orden de Compra"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.purchaseOrderId !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.purchaseOrderId !== undefined) {
                      onUnpinField('purchaseOrderId');
                    } else {
                      onPinField(
                        'purchaseOrderId',
                        formikValues.purchaseOrderId,
                      );
                    }
                  }}
                >
                  <AutocompleteInput
                    {...field}
                    id="purchaseOrderId"
                    icon={FaClipboardList}
                    options={(purchaseOrders || []).map((po) => ({
                      label: po?.label || '',
                      value: po?.value || '',
                    }))}
                    isClearable
                    allowOther
                    onOtherSelected={onOtherPurchaseOrderSelected}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field name="invoiceId">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Factura"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.invoiceId !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.invoiceId !== undefined) {
                      onUnpinField('invoiceId');
                    } else {
                      onPinField('invoiceId', formikValues.invoiceId);
                    }
                  }}
                >
                  <AutocompleteInput
                    {...field}
                    id="invoiceId"
                    icon={FaFileInvoice}
                    options={(invoices || []).map((invoice) => ({
                      label: invoice?.label || '',
                      value: invoice?.value || '',
                    }))}
                    isClearable
                    allowOther
                    onOtherSelected={onOtherInvoiceSelected}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field name="locationId">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Ubicación"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.locationId !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.locationId !== undefined) {
                      onUnpinField('locationId');
                    } else {
                      onPinField('locationId', formikValues.locationId);
                    }
                  }}
                >
                  <AutocompleteInput
                    {...field}
                    id="locationId"
                    icon={FaMapMarkerAlt}
                    options={(locations || []).map((location) => ({
                      label: location?.label || '',
                      value: location?.value || '',
                    }))}
                    isClearable
                    allowOther
                    onOtherSelected={onOtherLocationSelected}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <Field
            name="serialNumber"
            id="serialNumber"
            component={SerialNumberField}
            icon={TbNumber123}
            label="Número de Serie"
            className="col-span-12 md:col-span-4"
            inventoryId={inventoryId}
          />
          <Field
            name="activeNumber"
            id="activeNumber"
            component={TextInput}
            icon={AiOutlineFieldNumber}
            label="Número de Activo"
            className="col-span-12 md:col-span-4"
          />
          <div className="col-span-12 md:col-span-4">
            <Field name="receptionDate">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Fecha de Recepción"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.receptionDate !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.receptionDate !== undefined) {
                      onUnpinField('receptionDate');
                    } else {
                      onPinField('receptionDate', formikValues.receptionDate);
                    }
                  }}
                >
                  <DateInput
                    {...field}
                    id="receptionDate"
                    title="Fecha de Recepción"
                    icon={MdCalendarToday}
                    max={new Date().toLocaleDateString('en-CA')}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>

          <div className="col-span-12">
            <Field name="conditions">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Condición del Inventario"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.conditions !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.conditions !== undefined) {
                      onUnpinField('conditions');
                    } else {
                      onPinField('conditions', formikValues.conditions);
                    }
                  }}
                >
                  <MultiSelectInput
                    {...field}
                    id="conditions"
                    icon={MdInfo}
                    options={inventoryConditions.map((condition) => ({
                      label: condition.name,
                      value: condition.id,
                    }))}
                  />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <div className="col-span-12">
            <Field name="comments">
              {({ field, form }) => (
                <PinnableInputWrapper
                  field={field}
                  form={form}
                  label="Observaciones"
                  isPinMode={isPinMode}
                  isPinned={pinnedFields.comments !== undefined}
                  onTogglePin={() => {
                    if (pinnedFields.comments !== undefined) {
                      onUnpinField('comments');
                    } else {
                      onPinField('comments', formikValues.comments);
                    }
                  }}
                >
                  <TextArea {...field} id="comments" />
                </PinnableInputWrapper>
              )}
            </Field>
          </div>
          <p
            style={{
              width: '100%',
              textAlign: 'center',
              borderBottom: '1px solid #e2e8f0',
              lineHeight: '0.1em',
              margin: '10px 0 20px',
            }}
            className="col-span-12 text-sm md:text-base font-semibold pt-4"
          >
            <span style={{ background: '#fff', padding: '0 10px' }}>
              Información Adicional
            </span>
          </p>
          {/* AQui debe ir el componente de SelectCustomFields */}
          <CustomFieldManager
            name="customFields"
            customFields={customFields}
            createCustomField={createCustomField}
            currentCustomFields={currentCustomFields}
            // Props del sistema de pin para campos personalizados
            isPinMode={isPinMode}
            pinnedFields={pinnedFields}
            onPinField={onPinField}
            onUnpinField={onUnpinField}
            formikValues={formikValues}
          />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 h-full">
        <p
          style={{
            width: '100%',
            textAlign: 'center',
            borderBottom: '1px solid #e2e8f0',
            lineHeight: '0.1em',
            margin: '10px 0 20px',
          }}
          className="col-span-12 text-sm md:text-base font-semibold"
        >
          <span style={{ background: '#fff', padding: '0 10px' }}>
            Recursos del Inventario
          </span>
        </p>
        <div className="w-full h-full space-y-4">
          <Field
            name="images"
            id="images"
            component={ImagePicker}
            label="Imagenes"
            multiple
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

export default React.memo(InventoryFormFields);
