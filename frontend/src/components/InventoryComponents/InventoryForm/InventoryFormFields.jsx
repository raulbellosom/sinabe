import { memo, createElement } from 'react';
import { Field } from 'formik';
import TextInput from '../../Inputs/TextInput';
import PinnableInputWrapper from '../../Inputs/PinnableInputWrapper';
import SelectInput from '../../Inputs/SelectInput';
import DateInput from '../../Inputs/DateInput';
import TextArea from '../../Inputs/TextArea';
import FileInput from '../../Inputs/FileInput';
import {
  Info,
  Calendar,
  Hash,
  Box,
  ClipboardList,
  FileText,
  MapPin,
  Package,
  Image,
  Paperclip,
  Settings2,
} from 'lucide-react';
import MultiSelectInput from '../../Inputs/MultiSelectInput';
import ImagePicker from '../../Inputs/ImagePicker';
import CustomFieldManager from '../../Inputs/CustomFieldManager';
import AutocompleteInput from '../../Inputs/AutoCompleteInput';
import SerialNumberField from '../../Inputs/SerialNumberField';
import FormSection from '../../ui/FormSection';

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
  const _createPinnableField = (fieldName, label, component, props = {}) => (
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
          {createElement(component, {
            ...field,
            ...props,
            id: fieldName,
          })}
        </PinnableInputWrapper>
      )}
    </Field>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Form Section - Left Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* General Information Section */}
        <FormSection
          title="Información General"
          icon={Package}
          variant="card"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Model - Full width on mobile, 8 cols on desktop */}
            <div className="md:col-span-8">
              <Field name="modelId">
                {({ field, form }) => (
                  <PinnableInputWrapper
                    field={field}
                    form={form}
                    label="Modelo"
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
                      icon={Box}
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

            {/* Status - 4 cols */}
            <div className="md:col-span-4">
              <Field name="status">
                {({ field, form }) => (
                  <PinnableInputWrapper
                    field={field}
                    form={form}
                    label="Estado"
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
                      icon={Info}
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

            {/* Purchase Order, Invoice, Location - 4 cols each */}
            <div className="md:col-span-4">
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
                      icon={ClipboardList}
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

            <div className="md:col-span-4">
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
                      icon={FileText}
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

            <div className="md:col-span-4">
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
                      icon={MapPin}
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

            {/* Serial Number, Active Number, Reception Date - 4 cols each */}
            <Field
              name="serialNumber"
              id="serialNumber"
              component={SerialNumberField}
              icon={Hash}
              label="Número de Serie"
              className="md:col-span-4"
              inventoryId={inventoryId}
            />
            <Field
              name="activeNumber"
              id="activeNumber"
              component={TextInput}
              icon={Hash}
              label="Número de Activo"
              className="md:col-span-4"
            />
            <div className="md:col-span-4">
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
                      icon={Calendar}
                      max={new Date().toLocaleDateString('en-CA')}
                    />
                  </PinnableInputWrapper>
                )}
              </Field>
            </div>

            {/* Conditions - Full width */}
            <div className="md:col-span-12">
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
                      icon={Info}
                      options={inventoryConditions.map((condition) => ({
                        label: condition.name,
                        value: condition.id,
                      }))}
                    />
                  </PinnableInputWrapper>
                )}
              </Field>
            </div>

            {/* Comments - Full width */}
            <div className="md:col-span-12">
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
          </div>
        </FormSection>

        {/* Custom Fields Section */}
        <FormSection
          title="Campos Personalizados"
          description="Agrega información adicional según tus necesidades"
          icon={Settings2}
          variant="card"
        >
          <CustomFieldManager
            name="customFields"
            customFields={customFields}
            createCustomField={createCustomField}
            currentCustomFields={currentCustomFields}
            isPinMode={isPinMode}
            pinnedFields={pinnedFields}
            onPinField={onPinField}
            onUnpinField={onUnpinField}
            formikValues={formikValues}
          />
        </FormSection>
      </div>

      {/* Resources Section - Right Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Images Section */}
        <FormSection
          title="Imágenes"
          icon={Image}
          variant="card"
        >
          <Field
            name="images"
            id="images"
            component={ImagePicker}
            multiple
          />
        </FormSection>

        {/* Files Section */}
        <FormSection
          title="Archivos"
          icon={Paperclip}
          variant="card"
        >
          <Field
            name="files"
            id="files"
            component={FileInput}
            multiple
            helperText="PDF, Word, Excel, Imágenes, RAR, ZIP"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.rar,.zip,.tar,.gz,.ppt,.pptx,.mp4,.avi,.mov,.json,.xml"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default memo(InventoryFormFields);
