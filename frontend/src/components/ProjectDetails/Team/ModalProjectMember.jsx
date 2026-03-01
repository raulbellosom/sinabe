// src/components/Projects/ModalProjectMember.jsx

import ReusableModal from '../../Modals/ReusableModal';
import Combobox from '../../common/Combobox';
import { Formik, Form, Field } from 'formik';
import Notifies from '../../Notifies/Notifies';
import {
  useAddUserToProject,
  useUpdateProjectMember,
} from '../../../hooks/useProjectTeam';
import { searchAvailableUsers } from '../../../services/projectTeam.api';
import { UserPlus, UserCog, User, UserCheck, Save, X } from 'lucide-react';
import { FormattedUrlImage } from '../../../utils/FormattedUrlImage';

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
        thumbnail: FormattedUrlImage(user.photo?.[0]?.thumbnail) || null,
      }));
    } catch {
      return [];
    }
  };

  const customUserOption = ({ data }) => (
    <div className="flex items-center w-full">
      {data.thumbnail ? (
        <img
          src={data.thumbnail}
          alt={data.label}
          className="w-8 h-8 rounded-full mr-3"
        />
      ) : (
        <div className="w-8 h-8 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mr-3 text-sm font-semibold text-[var(--foreground-muted)]">
          {data.label
            ?.split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {data.label}
        </p>
        <p className="text-xs text-[var(--foreground-muted)] truncate">
          {data.email}
        </p>
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
            <UserCog className="text-[color:var(--primary)]" />
          ) : (
            <UserPlus className="text-[color:var(--primary)]" />
          )}
          {isEditing ? 'Editar miembro' : 'Agregar miembro'}
        </span>
      }
      size="md"
    >
      <p className="text-sm text-[color:var(--foreground-muted)] mb-4">
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
                <Combobox
                  label={
                    <span className="flex items-center gap-2">
                      <User className="text-[color:var(--foreground-muted)]" />{' '}
                      Usuario
                    </span>
                  }
                  cacheOptions
                  defaultOptions
                  loadOptions={loadUsers}
                  placeholder="Buscar por nombre o email"
                  value={values.user}
                  onChange={(value) => setFieldValue('user', value)}
                  components={{ Option: customUserOption }}
                  error={errors.user && touched.user ? errors.user : null}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1">
                <span className="flex items-center gap-2">
                  <UserCheck className="text-[color:var(--foreground-muted)]" />{' '}
                  Rol en el proyecto
                </span>
              </label>
              <Field
                type="text"
                name="role"
                placeholder="Ej. Técnico, Coordinador"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] p-2.5 focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-colors"
              />
              {errors.role && touched.role && (
                <div className="text-[color:var(--danger)] text-sm mt-1">
                  {errors.role}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-[color:var(--surface-muted)] hover:bg-[color:var(--border)] text-[color:var(--foreground)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X /> Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[color:var(--primary)] hover:opacity-90 text-[color:var(--primary-foreground)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save /> {isEditing ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ReusableModal>
  );
};

export default ModalProjectMember;
