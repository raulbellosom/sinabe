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
  code: Yup.string().required('Orden de compra es requerido'),
  supplier: Yup.string(),
  description: Yup.string(),
  status: Yup.string().required('Estado es requerido'),
  date: Yup.date().typeError('Fecha inválida'),
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
    status: order?.status || 'PLANIFICACION',
    date: order ? order.date.slice(0, 10) : '',
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
            {/* Primera fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">
                  Orden de compra
                </label>
                <Field
                  name="code"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
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
                />
                <ErrorMessage
                  name="supplier"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Estado</label>
                <Field
                  as="select"
                  name="status"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                >
                  <option value="PLANIFICACION">Planificación</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="EN_EJECUCION">En Ejecución</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              {/* Fecha */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Fecha</label>
                <Field
                  name="date"
                  type="date"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                />
                <ErrorMessage
                  name="date"
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
