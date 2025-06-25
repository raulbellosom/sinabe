// UsersPage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { useUserQueryParams } from '../../hooks/useUserQueryParams';
import { useUserContext } from '../../context/UserContext';
import { useRoleContext } from '../../context/RoleContext';
import useCheckPermissions from '../../hooks/useCheckPermissions';

import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ModalFormikForm from '../../components/Modals/ModalFormikForm';
import ModalRemove from '../../components/Modals/ModalRemove';
import FilterDropdown from '../../components/Inputs/FilterDropdown';
import ImageViewer from '../../components/ImageViewer/ImageViewer2';

import UserFormFields from '../../components/Users/UserFormFields';
import UserChangePasswordFormFields from '../../components/Users/UserChangePasswordFormFields';
import {
  UserFormSchema,
  UserFormUpdateSchema,
  UserFormChangePasswordSchema,
} from '../../components/Users/UserFormSchema';

import {
  FaUserShield,
  FaLock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
} from 'react-icons/fa';
import ReusableTable from '../../components/Table/ReusableTable';

const UsersPage = () => {
  const { query, updateQuery } = useUserQueryParams();

  const { data, isLoading, error, refetch } = useSearchUsers(query);
  const users = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: query.pageSize,
  };

  const { roles } = useRoleContext();
  const { useCreateUser, useUpdateUser, useDeleteUser, useChangePasswordUser } =
    useUserContext();

  const isCreate = useCheckPermissions('create_users');
  const isEdit = useCheckPermissions('edit_users');
  const isDelete = useCheckPermissions('delete_users');

  const [isModalOpen, setModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const openEditModal = (user) => {
    setEditMode(true);
    setUserToEdit({ ...user, role: user.role.id });
    setModalOpen(true);
  };

  const handleSubmit = async (values, helpers) => {
    try {
      editMode ? await useUpdateUser(values) : await useCreateUser(values);
      helpers.setSubmitting(false);
      helpers.resetForm();
      setModalOpen(false);
      setEditMode(false);
      refetch();
    } catch (e) {
      console.error('Error al guardar usuario', e);
    }
  };

  const openChangePassword = (user) => {
    setUserToEdit({ id: user.id, password: '', repeatPassword: '' });
    setChangePasswordModal(true);
  };

  const handlePasswordChange = async (values, helpers) => {
    try {
      await useChangePasswordUser(values);
      helpers.setSubmitting(false);
      setChangePasswordModal(false);
      refetch();
    } catch (e) {
      console.error('Error al cambiar contraseña', e);
    }
  };

  const confirmRemove = async () => {
    try {
      await useDeleteUser(userToDelete.id);
      setRemoveModalOpen(false);
      refetch();
    } catch (e) {
      console.error('Error al eliminar usuario', e);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'photo',
        title: 'Foto',
        render: (_, row) =>
          row.photo?.[0] ? (
            <ImageViewer
              containerClassNames="w-12 h-12 rounded-md"
              images={[row.photo[0]]}
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-stone-200 flex justify-center items-center">
              <span className="text-stone-500 font-bold text-xl">
                {row.firstName?.[0]}
                {row.lastName?.[0]}
              </span>
            </div>
          ),
        headerClassName: 'w-16',
      },
      { key: 'firstName', title: 'Nombre', sortable: true },
      { key: 'lastName', title: 'Apellido', sortable: true },
      { key: 'email', title: 'Correo', sortable: true },
      { key: 'phone', title: 'Teléfono', sortable: true },
      {
        key: 'role',
        title: 'Rol',
        sortable: true,
        render: (val) => val?.name || '-',
      },
      {
        key: 'status',
        title: 'Estado',
        render: (val) => (
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${val ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {val ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [],
  );

  const rowActions = (user) => [
    {
      key: 'main',
      label: 'Editar',
      icon: FaEdit,
      action: isEdit.hasPermission ? () => openEditModal(user) : null,
      color: 'blue',
    },
    {
      label: 'Cambiar Contraseña',
      icon: FaLock,
      action: isEdit.hasPermission ? () => openChangePassword(user) : null,
    },
    {
      label: 'Eliminar',
      icon: FaTrash,
      action: isDelete.hasPermission
        ? () => {
            setUserToDelete(user);
            setRemoveModalOpen(true);
          }
        : null,
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaUserShield className="text-purple-500" /> Usuarios
        </h1>
        <div className="flex items-center gap-2">
          <ActionButtons
            extraActions={[
              {
                label: 'Nuevo',
                icon: FaPlus,
                action: isCreate.hasPermission
                  ? () => setModalOpen(true)
                  : null,
                color: 'indigo',
                filled: true,
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="relative w-full sm:w-auto flex-grow max-w-md">
          <input
            type="text"
            placeholder="Buscar..."
            value={query.searchTerm || ''}
            onChange={(e) =>
              updateQuery({ ...query, searchTerm: e.target.value, page: 1 })
            }
            className="pl-10 pr-4 py-2 border-gray-300 rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <FilterDropdown
          buttonText="Rol"
          options={roles.map((r) => ({ id: r.name, name: r.name }))}
          selected={query.roles}
          setSelected={(selected) =>
            updateQuery({ ...query, roles: selected, page: 1 })
          }
          titleDisplay="Filtrar por rol"
          label="Filtrar por rol"
        />
      </div>

      <ReusableTable
        columns={columns}
        data={users}
        pagination={pagination}
        loading={isLoading}
        error={error}
        sortConfig={{ key: query.sortBy, direction: query.order }}
        onSort={(key) => {
          const direction =
            query.sortBy === key && query.order === 'asc' ? 'desc' : 'asc';
          updateQuery({ ...query, sortBy: key, order: direction });
        }}
        onPageChange={(page) => updateQuery({ ...query, page })}
        onPageSizeChange={(size) =>
          updateQuery({ ...query, pageSize: size, page: 1 })
        }
        rowActions={rowActions}
        enableCardView={true}
        cardViewConfig={{
          imageKey: 'photo',
          titleKey: 'firstName',
          subtitleKey: 'lastName',
        }}
        rowKey="id"
      />

      {/* Modales */}
      {isModalOpen && (
        <ModalFormikForm
          onClose={() => {
            setModalOpen(false);
            setEditMode(false);
            setUserToEdit(null);
          }}
          isOpenModal={isModalOpen}
          title={editMode ? 'Editar Usuario' : 'Crear Usuario'}
          schema={editMode ? UserFormUpdateSchema : UserFormSchema}
          initialValues={
            userToEdit || {
              firstName: '',
              lastName: '',
              email: '',
              userName: '',
              phone: '',
              role: '',
              photo: '',
              status: true,
              password: '',
              repeatPassword: '',
            }
          }
          onSubmit={handleSubmit}
          formFields={<UserFormFields editMode={editMode} roles={roles} />}
          saveLabel={editMode ? 'Actualizar' : 'Guardar'}
        />
      )}

      {changePasswordModal && (
        <ModalFormikForm
          onClose={() => setChangePasswordModal(false)}
          isOpenModal={changePasswordModal}
          title="Cambiar contraseña"
          schema={UserFormChangePasswordSchema}
          initialValues={
            userToEdit || { id: '', password: '', repeatPassword: '' }
          }
          onSubmit={handlePasswordChange}
          formFields={<UserChangePasswordFormFields />}
          saveLabel="Actualizar"
        />
      )}

      {isRemoveModalOpen && (
        <ModalRemove
          isOpenModal={isRemoveModalOpen}
          onCloseModal={() => setRemoveModalOpen(false)}
          removeFunction={confirmRemove}
        />
      )}
    </div>
  );
};

export default UsersPage;
