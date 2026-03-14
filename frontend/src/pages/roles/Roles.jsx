import React, { useState, useEffect } from 'react';
import { useRoleContext } from '../../context/RoleContext';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import classNames from 'classnames';
import { PermissionsByGroup } from '../../utils/Permissions';
import { usePermissionContext } from '../../context/PermissionContext';
import ModalFormikForm from '../../components/Modals/ModalFormikForm';
import { RoleFormSchema } from '../../components/Roles/RoleFormSchema';
import RoleFormFields from '../../components/Roles/RoleFormFields';
import ModalRemove from '../../components/Modals/ModalRemove';
import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import PermissionsManagerModal from '../../components/Roles/PermissionsManagerModal';

// ─── Toggle switch ────────────────────────────────────────────────────────────
const PermissionToggle = ({ checked, disabled, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange && onChange(!checked)}
    className={classNames(
      'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
      checked ? 'bg-(--primary)' : 'bg-(--border)',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    )}
  >
    <span
      className={classNames(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      )}
    />
  </button>
);

// ─── Permission group accordion ───────────────────────────────────────────────
const PermissionGroup = ({
  title,
  permissions,
  rolePermissions,
  disabled,
  onToggle,
}) => {
  const [open, setOpen] = useState(true);
  const syncedPermissions = permissions.filter((p) => p.id);
  const activeCount = syncedPermissions.filter((p) =>
    rolePermissions?.find((r) => r?.permissionId === p?.id),
  ).length;
  const total = syncedPermissions.length;

  return (
    <div className="overflow-hidden rounded-xl border border-(--border)">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-(--surface) px-4 py-3 transition-colors duration-150 hover:bg-(--surface-muted)"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={classNames(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
              activeCount > 0
                ? 'bg-(--primary)/15 text-(--primary)'
                : 'bg-(--border)/60 text-(--foreground-muted)',
            )}
          >
            <ShieldCheck size={14} />
          </span>
          <span className="truncate text-sm font-semibold text-(--foreground)">
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={classNames(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              activeCount === total && total > 0
                ? 'bg-(--primary)/15 text-(--primary)'
                : activeCount > 0
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-(--border)/60 text-(--foreground-muted)',
            )}
          >
            {activeCount}/{total}
          </span>
          <ChevronDown
            size={15}
            className={classNames(
              'text-(--foreground-muted) transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>

      <div
        className={classNames(
          'overflow-hidden transition-all duration-300 ease-out',
          open ? 'max-h-200 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="grid grid-cols-1 gap-0.5 bg-(--background) p-2 sm:grid-cols-2">
          {permissions.map((permission) => {
            const isActive = !!rolePermissions?.find(
              (r) => r?.permissionId === permission?.id,
            );
            const isSynced = !!permission.id;
            return (
              <label
                key={permission.id || permission.name}
                className={classNames(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150',
                  isSynced
                    ? 'cursor-pointer hover:bg-(--surface)'
                    : 'cursor-not-allowed opacity-50',
                )}
              >
                <PermissionToggle
                  checked={isActive}
                  disabled={disabled || !isSynced}
                  onChange={(val) => isSynced && onToggle(permission, val)}
                />
                <span className="flex-1 text-sm leading-tight text-(--foreground)">
                  {permission.description}
                </span>
                {!isSynced && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-amber-500">
                    <AlertTriangle size={11} />
                    Sin sync
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [permSearch, setPermSearch] = useState('');

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
      setGroupedPermissions(
        mapPermissionsToGroups(PermissionsByGroup, permissions),
      );
    }
  }, [permissions]);

  const changeActiveTab = (tab) => {
    setActiveTab(tab?.id);
    getRolePermissionsByRoleId(tab?.id);
    setRoleName(tab?.name);
  };

  const updateRolePermission = async (permission, isChecked) => {
    setIsDisabled(true);
    if (isChecked) {
      await useCreateRolePermission({
        roleId: activeTab,
        permissionId: permission.id,
      });
    } else {
      await useDeleteRolePermission({
        roleId: activeTab,
        permissionId: permission.id,
      });
    }
    setTimeout(() => setIsDisabled(false), 1000);
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
    const updated = {};
    Object.keys(frontendPermissions).forEach((key) => {
      const group = frontendPermissions[key];
      updated[key] = {
        ...group,
        permissions: group.permissions.map((name) => {
          const found = backendPermissions.find((p) => p.name === name);
          return (
            found ?? {
              name,
              id: null,
              description: 'Descripción no disponible',
            }
          );
        }),
      };
    });
    return updated;
  };

  const filteredGroups = Object.entries(groupedPermissions)
    .map(([key, group]) => ({
      key,
      ...group,
      permissions: permSearch
        ? group.permissions.filter((p) =>
            p.description.toLowerCase().includes(permSearch.toLowerCase()),
          )
        : group.permissions,
    }))
    .filter((g) => g.permissions.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalActivePermissions = rolePermissions?.length ?? 0;

  return (
    <>
      {/* ── Page ── */}
      <div className="space-y-4">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--primary)/15 text-(--primary)">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-(--foreground)">
                Control de Roles
              </h1>
              <p className="text-xs text-(--foreground-muted)">
                Gestiona roles y sus permisos del sistema
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isEditRolesPermission.hasPermission && (
              <button
                type="button"
                onClick={() => setIsPermsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--surface-muted)"
              >
                <Settings2 size={15} />
                <span className="hidden sm:inline">Gestionar Permisos</span>
                <span className="sm:hidden">Permisos</span>
              </button>
            )}
            {isCreateRolesPermission.hasPermission && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-medium text-(--primary-foreground) shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus size={15} />
                Nuevo Rol
              </button>
            )}
          </div>
        </div>

        {/* Mobile: horizontal role chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {roles
            ?.slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((role) => {
              const isActive = activeTab === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => changeActiveTab(role)}
                  className={classNames(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-(--primary) text-(--primary-foreground)'
                      : 'border border-(--border) bg-(--surface) text-(--foreground) hover:bg-(--surface-muted)',
                  )}
                >
                  <span
                    className={classNames(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold uppercase',
                      isActive
                        ? 'bg-white/20'
                        : 'bg-(--primary)/10 text-(--primary)',
                    )}
                  >
                    {role.name.charAt(0)}
                  </span>
                  {role.name}
                </button>
              );
            })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">

          {/* Left: Roles list (desktop only) */}
          <div className="hidden lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-(--foreground)">Roles</span>
              <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-xs font-medium text-(--foreground-muted)">
                {roles?.length ?? 0}
              </span>
            </div>
            {roles
              ?.slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((role) => {
                const isActive = activeTab === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => changeActiveTab(role)}
                    className={classNames(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                      isActive
                        ? 'bg-(--primary)/10 ring-1 ring-inset ring-(--primary)/30'
                        : 'hover:bg-(--surface)',
                    )}
                  >
                    <span
                      className={classNames(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase transition-colors',
                        isActive
                          ? 'bg-(--primary) text-(--primary-foreground)'
                          : 'bg-(--surface) text-(--foreground-muted) group-hover:bg-(--primary)/15 group-hover:text-(--primary)',
                      )}
                    >
                      {role.name.charAt(0)}
                    </span>
                    <span
                      className={classNames(
                        'flex-1 truncate text-sm font-medium',
                        isActive ? 'text-(--primary)' : 'text-(--foreground)',
                      )}
                    >
                      {role.name}
                    </span>
                    {isActive && (
                      <Check size={14} className="shrink-0 text-(--primary)" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Right: Permissions */}
          <div className="flex flex-col gap-3 lg:col-span-2">

            {/* Permissions header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-(--foreground)">
                  Permisos de{' '}
                  <span className="text-(--primary)">{roleName ?? '—'}</span>
                </h2>
                <p className="text-xs text-(--foreground-muted)">
                  {totalActivePermissions} permiso
                  {totalActivePermissions !== 1 ? 's' : ''} activo
                  {totalActivePermissions !== 1 ? 's' : ''}
                </p>
              </div>
              {activeTab && (
                <div className="flex items-center gap-2">
                  {isEditRolesPermission.hasPermission && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(true);
                        setIsModalOpen(true);
                      }}
                      title="Editar rol"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--foreground-muted) transition-colors hover:bg-(--surface-muted) hover:text-(--foreground)"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {isDeleteRolesPermission.hasPermission && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      title="Eliminar rol"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--foreground-muted) transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/40 dark:hover:bg-red-500/10"
                    >
                      <ShieldOff size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--foreground-muted)"
              />
              <input
                type="text"
                placeholder="Buscar permiso..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="w-full rounded-xl border border-(--border) bg-(--surface) py-2 pl-8 pr-3 text-sm text-(--foreground) placeholder:text-(--foreground-muted) outline-none transition-colors focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
              />
            </div>

            {/* Permission groups */}
            {activeTab ? (
              <div className="flex flex-col gap-2 pb-4">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <PermissionGroup
                      key={group.key}
                      title={group.name}
                      permissions={group.permissions}
                      rolePermissions={rolePermissions}
                      disabled={isDisabled || !isDeleteRolesPermission.hasPermission}
                      onToggle={updateRolePermission}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--surface) py-12 text-center">
                    <Search size={24} className="text-(--foreground-muted)" />
                    <p className="text-sm text-(--foreground-muted)">
                      No se encontraron permisos con "{permSearch}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-(--border) bg-(--surface) py-16 text-center">
                <Shield size={36} className="text-(--foreground-muted)" />
                <p className="text-sm text-(--foreground-muted)">
                  Selecciona un rol para ver sus permisos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {isModalOpen && (
        <ModalFormikForm
          onClose={closeModal}
          dismissible
          isOpenModal={isModalOpen}
          title={editMode ? 'Editar Rol' : 'Crear Rol'}
          schema={RoleFormSchema}
          initialValues={
            editMode ? { name: roleName, id: activeTab } : { name: '', id: '' }
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

      <PermissionsManagerModal
        isOpen={isPermsModalOpen}
        onClose={() => setIsPermsModalOpen(false)}
      />
    </>
  );
};

const ProtectedRolesView = withPermission(Roles, 'view_roles');

export default React.memo(ProtectedRolesView);
