import React, { useState, useEffect } from 'react';
import { useRoleContext } from '../../context/RoleContext';
import TableHeader from '../../components/Table/TableHeader';
import {
  Plus,
  ChevronRight,
  ShieldCheck,
  Pencil,
  Shield,
  MoreVertical,
  ShieldOff,
  Settings2,
} from 'lucide-react';
import Accordion from '../../components/Accordion/Accordion';
import classNames from 'classnames';
import { PermissionsByGroup } from '../../utils/Permissions';
import { usePermissionContext } from '../../context/PermissionContext';
import { Dropdown, TextInput } from '../../components/ui/flowbite';
import ModalFormikForm from '../../components/Modals/ModalFormikForm';
import { RoleFormSchema } from '../../components/Roles/RoleFormSchema';
import RoleFormFields from '../../components/Roles/RoleFormFields';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ModalRemove from '../../components/Modals/ModalRemove';
import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import PermissionsManagerModal from '../../components/Roles/PermissionsManagerModal';

const Roles = () => {
  const {
    roles,
    useDeleteRole,
    useGetRoles,
    rolePermissions,
    useGetRolePermissionByRoleId,
    useCreateRolePermission,
    useDeleteRolePermission,
    useUpdateRole,
    useCreateRole,
  } = useRoleContext();
  const { permissions, useGetPermissions } = usePermissionContext();
  const [activeTab, setActiveTab] = useState(
    roles?.length > 0 ? roles[0]?.id : null,
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [roleName, setRoleName] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);

  const isCreateRolesPermission = useCheckPermissions('create_roles');
  const isEditRolesPermission = useCheckPermissions('edit_roles');
  const isDeleteRolesPermission = useCheckPermissions('delete_roles');

  useEffect(() => {
    useGetPermissions();
    useGetRoles();
  }, []);
  useEffect(() => {
    if (roles.length > 0 && activeTab) {
      getRolePermissionsByRoleId(activeTab);
      setRoleName(roles.find((role) => role.id === activeTab)?.name);
    }
  }, [activeTab]);

  const getRolePermissionsByRoleId = async (roleId) => {
    await useGetRolePermissionByRoleId(roleId);
  };

  useEffect(() => {
    if (permissions.length > 0) {
      const updatedPermissions = mapPermissionsToGroups(
        PermissionsByGroup,
        permissions,
      );
      setGroupedPermissions(updatedPermissions);
    }
  }, [permissions]);

  const changeActiveTab = (tab) => {
    setActiveTab(tab?.id);
    getRolePermissionsByRoleId(tab?.id);
    setRoleName(tab?.name);
  };

  const updateRolePermission = async (rolePermission, isChecked) => {
    setIsDisabled(true);
    if (isChecked) {
      await useCreateRolePermission({
        roleId: activeTab,
        permissionId: rolePermission.id,
      });
    } else {
      await useDeleteRolePermission({
        roleId: activeTab,
        permissionId: rolePermission.id,
      });
    }
    setTimeout(() => {
      setIsDisabled(false);
    }, 1000);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode ? await useUpdateRole(values) : await useCreateRole(values);
      setSubmitting(false);
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setEditMode(false);
    setIsModalOpen(false);
  };

  const handleDeleteRole = async () => {
    try {
      await useDeleteRole(activeTab);
      setActiveTab(roles[0]?.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const mapPermissionsToGroups = (frontendPermissions, backendPermissions) => {
    const updatedGroups = {};

    Object.keys(frontendPermissions).forEach((groupKey) => {
      const group = frontendPermissions[groupKey];
      updatedGroups[groupKey] = {
        ...group,
        permissions: group.permissions.map((permissionName) => {
          const backendPermission = backendPermissions.find(
            (p) => p.name === permissionName,
          );

          return backendPermission
            ? { ...backendPermission }
            : {
                name: permissionName,
                id: null,
                description: 'Descripción no disponible',
              };
        }),
      };
    });

    return updatedGroups;
  };
  const handleContentTabs = () => {
    return Object.keys(groupedPermissions)
      .map((groupKey) => {
        const group = groupedPermissions[groupKey];

        return {
          title: group.name,
          content: (
            <div className="space-y-6">
              <div className="grid gap-2 grid-cols-1" key={groupKey}>
                {group.permissions.map((permission) => (
                  <label
                    key={permission.id || permission.name}
                    className={classNames(
                      'flex items-center gap-2 p-2 rounded-md',
                      permission.id
                        ? 'hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    {isDeleteRolesPermission.hasPermission ? (
                      <TextInput
                        color={'warning'}
                        type="checkbox"
                        name={permission.name}
                        value={permission.name}
                        disabled={
                          isDisabled || !isDeleteRolesPermission.hasPermission
                        }
                        checked={
                          !!rolePermissions?.find(
                            (p) => p?.permissionId === permission?.id,
                          )
                        }
                        onChange={(e) =>
                          updateRolePermission(permission, e.target.checked)
                        }
                      />
                    ) : (
                      <TextInput
                        color={'warning'}
                        type="checkbox"
                        name={permission.name}
                        value={permission.name}
                        disabled={
                          isDisabled || !isDeleteRolesPermission.hasPermission
                        }
                        checked={
                          !!rolePermissions?.find(
                            (p) => p?.permissionId === permission?.id,
                          )
                        }
                        onChange={null}
                      />
                    )}
                    <span className="text-sm lg:text-base text-neutral-700 dark:text-neutral-200">
                      {permission.description}
                    </span>
                    {!permission.id && (
                      <span className="text-xs text-amber-500 dark:text-amber-400 ml-auto">
                        Sin sincronizar
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  return (
    <>
      <section className="flex flex-col gap-3 min-h-full h-full bg-white dark:bg-neutral-900 shadow-md rounded-md p-3 pb-0 antialiased">
        <TableHeader
          title="Control de Roles"
          icon={ShieldCheck}
          actions={[
            ...(isEditRolesPermission.hasPermission
              ? [
                  {
                    label: 'Gestionar Permisos',
                    action: () => setIsPermsModalOpen(true),
                    color: 'violet',
                    icon: Settings2,
                    filled: false,
                  },
                ]
              : []),
            {
              label: 'Agregar Rol',
              action: isCreateRolesPermission.hasPermission
                ? () => setIsModalOpen(true)
                : null,
              color: 'primary',
              icon: Plus,
              filled: true,
            },
          ]}
        />
        <div className="h-full grid grid-cols-3 gap-8 p-2 pt-4 pb-0">
          <div className="col-span-3 lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-sm lg:text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                Roles
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Selecciona un rol para ver sus permisos
              </p>
            </div>
            {roles
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((role) => (
                <div
                  key={role.id}
                  onClick={() => changeActiveTab(role)}
                  className={classNames(
                    'group p-4 border-b border-neutral-100 dark:border-neutral-700 cursor-pointer flex justify-between items-center transition-colors',
                    activeTab === role.id
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                  )}
                >
                  <div className="flex gap-4 items-center">
                    <Shield
                      size={20}
                      className={classNames(
                        activeTab === role.id
                          ? 'text-violet-500'
                          : 'text-neutral-400 dark:text-neutral-500',
                      )}
                    />
                    <h3 className="text-sm lg:text-base font-semibold">
                      {role.name}
                    </h3>
                  </div>
                  <ChevronRight
                    size={18}
                    className={classNames(
                      'transition-all duration-200',
                      activeTab === role.id
                        ? 'text-violet-500'
                        : 'text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400',
                    )}
                  />
                </div>
              ))}
          </div>
          <div className="col-span-3 lg:col-span-2 h-full lg:max-h-[76dvh] overflow-hidden">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-sm lg:text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  Permisos del rol&nbsp;
                  <span className="text-violet-600 dark:text-violet-400">
                    {roleName}
                  </span>
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Selecciona una vista para administrar los permisos del rol
                  seleccionado
                </p>
              </div>
              {(isDeleteRolesPermission.hasPermission ||
                isEditRolesPermission.hasPermission) && (
                <Dropdown
                  label={
                    <MoreVertical
                      size={36}
                      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    />
                  }
                  dismissOnClick={false}
                  inline
                  arrowIcon={null}
                >
                  {isEditRolesPermission.hasPermission && (
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Editar rol',
                          action: () => {
                            setEditMode(true);
                            setIsModalOpen(true);
                          },
                          color: 'transparent',
                          icon: Pencil,
                          className:
                            'md:min-w-full border-none hover:bg-neutral-100 dark:hover:bg-neutral-700',
                        },
                      ]}
                    />
                  )}
                  {isDeleteRolesPermission.hasPermission && (
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Eliminar rol',
                          action: () => setIsDeleteModalOpen(true),
                          color: 'transparent',
                          filled: true,
                          icon: ShieldOff,
                          className:
                            'md:min-w-full border-none hover:bg-neutral-100 dark:hover:bg-neutral-700',
                        },
                      ]}
                    />
                  )}
                </Dropdown>
              )}
            </div>
            <div className="overflow-y-auto h-full md:max-h-[69dvh] w-full">
              {activeTab && <Accordion data={handleContentTabs() ?? []} />}
            </div>
          </div>
        </div>
      </section>
      {isModalOpen && (
        <ModalFormikForm
          onClose={closeModal}
          dismissible
          isOpenModal={isModalOpen}
          title={editMode ? 'Editar Rol' : 'Crear Rol'}
          schema={RoleFormSchema}
          initialValues={
            editMode
              ? {
                  name: roleName,
                  id: activeTab,
                }
              : {
                  name: '',
                  id: '',
                }
          }
          onSubmit={handleSubmit}
          formFields={<RoleFormFields />}
          saveLabel={editMode ? 'Actualizar Rol' : 'Crear Rol'}
        />
      )}
      {isDeleteModalOpen && (
        <ModalRemove
          isOpenModal={isDeleteModalOpen}
          onCloseModal={() => setIsDeleteModalOpen(false)}
          removeFunction={handleDeleteRole}
        />
      )}

      {/* Permissions Manager modal */}
      <PermissionsManagerModal
        isOpen={isPermsModalOpen}
        onClose={() => setIsPermsModalOpen(false)}
      />
    </>
  );
};

const ProtectedRolesView = withPermission(Roles, 'view_roles');

export default React.memo(ProtectedRolesView);
