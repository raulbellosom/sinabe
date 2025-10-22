// src/components/ProjectDetails/PO/PurchaseOrderFormModal.jsx
import React, { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaClipboardList, FaSave, FaTimes } from 'react-icons/fa';
import Notifies from '../../Notifies/Notifies';
import {
  useCreatePurchaseOrder,
  useCreatePurchaseOrderWithoutProject,
  useUpdatePurchaseOrder,
} from '../../../hooks/usePurchaseOrders';

// Validación de formulario de Orden de Compra
const PurchaseOrderSchema = Yup.object({
  code: Yup.string().required('Código es requerido'),
  supplier: Yup.string(),
  description: Yup.string(),
});

export const PurchaseOrderFormModal = ({
  projectId,
  order,
  isOpen,
  onClose,
}) => {
  const isEditing = Boolean(order);
  const createPO = useCreatePurchaseOrder(projectId);
  const updatePO = useUpdatePurchaseOrder(projectId);
  const createPOWithoutProject = useCreatePurchaseOrderWithoutProject();

  const initialValues = {
    code: order?.code || '',
    supplier: order?.supplier || '',
    description: order?.description || '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditing) {
        await updatePO.mutateAsync({ id: order.id, data: values });
        Notifies('success', 'Orden de compra actualizada');
      } else {
        if (projectId) {
          await createPO.mutateAsync(values);
        } else {
          await createPOWithoutProject.mutateAsync(values);
        }
        Notifies('success', 'Orden de compra creada');
      }
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      Notifies('error', err.message || 'Error al guardar orden de compra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaClipboardList className="text-purple-600" />
          {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        </span>
      }
      size="md"
      actions={[
        { label: 'Cancelar', color: 'stone', icon: FaTimes, action: onClose },
        {
          label: isEditing ? 'Actualizar' : 'Crear',
          color: 'purple',
          filled: true,
          icon: FaSave,
          action: () => document.getElementById('po-form-submit')?.click(),
        },
      ]}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={PurchaseOrderSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Campos principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">
                  Código <span className="text-red-500">*</span>
                </label>
                <Field
                  name="code"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                  placeholder="Ingrese el código de la orden"
                />
                <ErrorMessage
                  name="code"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Proveedor</label>
                <Field
                  name="supplier"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                  placeholder="Ingrese el nombre del proveedor"
                />
                <ErrorMessage
                  name="supplier"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Descripción</label>
              <Field
                as="textarea"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>
            {/* Hidden submit button */}
            <button
              type="submit"
              id="po-form-submit"
              className="hidden"
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default PurchaseOrderFormModal;
