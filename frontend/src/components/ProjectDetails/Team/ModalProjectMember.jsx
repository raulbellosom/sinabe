// src/components/Projects/ModalProjectMember.jsx
import React from 'react';
import ReusableModal from '../../Modals/ReusableModal';
import AsyncSelect from 'react-select/async';
import { Formik, Form, Field } from 'formik';
import Notifies from '../../Notifies/Notifies';
import {
  useAddUserToProject,
  useUpdateProjectMember,
} from '../../../hooks/useProjectTeam';
import { searchAvailableUsers } from '../../../services/projectTeam.api';
import {
  FaUserPlus,
  FaUserEdit,
  FaUser,
  FaUserTag,
  FaSave,
  FaTimes,
} from 'react-icons/fa';

const ModalProjectMember = ({
  isOpen,
  onClose,
  projectId,
  memberToEdit = null,
}) => {
  const isEditing = Boolean(memberToEdit);
  const addMember = useAddUserToProject(projectId);
  const updateMember = useUpdateProjectMember(projectId);

  const loadUsers = async (inputValue) => {
    try {
      const users = await searchAvailableUsers(inputValue || '', projectId);
      return users.map((user) => ({
        label: user.name,
        value: user.id,
        email: user.email,
        thumbnail: user.photo?.[0]?.thumbnail || null,
      }));
    } catch {
      return [];
    }
  };

  const customUserOption = ({ data, innerRef, innerProps }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
    >
      {data.thumbnail ? (
        <img
          src={data.thumbnail}
          alt={data.label}
          className="w-8 h-8 rounded-full mr-3"
        />
      ) : (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 text-sm font-semibold">
          {data.label
            ?.split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {data.label}
        </p>
        <p className="text-xs text-gray-500">{data.email}</p>
      </div>
    </div>
  );

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {isEditing ? (
            <FaUserEdit className="text-sinabe-primary" />
          ) : (
            <FaUserPlus className="text-sinabe-primary" />
          )}
          {isEditing ? 'Editar miembro' : 'Agregar miembro'}
        </span>
      }
      size="md"
    >
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
        {isEditing
          ? 'Edita el rol de este miembro asignado al proyecto.'
          : 'Selecciona un usuario activo y asígnale un rol dentro del proyecto.'}
      </p>

      <Formik
        initialValues={{ user: null, role: memberToEdit?.role || '' }}
        enableReinitialize
        validate={({ user, role }) => {
          const errors = {};
          if (!isEditing && !user) errors.user = 'Selecciona un usuario';
          if (!role) errors.role = 'Indica un rol';
          return errors;
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            if (isEditing) {
              await updateMember.mutateAsync({
                id: memberToEdit.id,
                data: { role: values.role },
              });
              Notifies('success', 'Miembro actualizado correctamente');
            } else {
              await addMember.mutateAsync({
                userId: values.user.value,
                role: values.role,
              });
              Notifies('success', 'Miembro agregado correctamente');
            }
            resetForm();
            onClose();
          } catch {
            Notifies('error', 'Error al guardar los cambios');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue, values, errors, touched }) => (
          <Form className="space-y-4">
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-2">
                    <FaUser className="text-gray-500" /> Usuario
                  </span>
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadUsers}
                  placeholder="Buscar por nombre o email"
                  value={values.user}
                  onChange={(value) => setFieldValue('user', value)}
                  components={{ Option: customUserOption }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'white',
                      borderColor: '#d1d5db',
                    }),
                  }}
                />
                {errors.user && touched.user && (
                  <div className="text-red-500 text-sm mt-1">{errors.user}</div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="flex items-center gap-2">
                  <FaUserTag className="text-gray-500" /> Rol en el proyecto
                </span>
              </label>
              <Field
                type="text"
                name="role"
                placeholder="Ej. Técnico, Coordinador"
                className="w-full rounded-md border border-gray-300 p-2"
              />
              {errors.role && touched.role && (
                <div className="text-red-500 text-sm mt-1">{errors.role}</div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaTimes /> Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-sinabe-primary hover:bg-sinabe-primary/80 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaSave /> {isEditing ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default ModalProjectMember;
