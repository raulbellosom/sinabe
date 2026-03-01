import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  PackagePlus,
  Layers,
  Loader2,
} from 'lucide-react';
import classNames from 'classnames';
import {
  PermissionsByGroup,
  getAllPermissionDefinitions,
} from '../../utils/Permissions';
import { usePermissionContext } from '../../context/PermissionContext';
import Notifies from '../Notifies/Notifies';

/* ------------------------------------------------------------------ */
/*  Small helpers                                                        */
/* ------------------------------------------------------------------ */
const Badge = ({ inDb }) =>
  inDb ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={11} />
      En BD
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
      <AlertCircle size={11} />
      Pendiente
    </span>
  );

/* ------------------------------------------------------------------ */
/*  Group accordion row                                                  */
/* ------------------------------------------------------------------ */
const GroupSection = ({
  groupKey,
  group,
  dbPermissions,
  onEdit,
  onDelete,
  onSyncGroup,
  onCreateSingle,
  syncingGroup,
  creatingSingle,
  editingId,
  editValues,
  setEditValues,
  onSaveEdit,
  onCancelEdit,
  allDefinitions,
}) => {
  const [open, setOpen] = useState(false);

  const permissionsWithStatus = group.permissions.map((name) => {
    const found = dbPermissions.find((p) => p.name === name);
    return { name, dbRecord: found || null };
  });

  const definedCount = permissionsWithStatus.filter((p) => p.dbRecord).length;
  const total = permissionsWithStatus.length;
  const pendingInGroup = permissionsWithStatus.filter((p) => !p.dbRecord);
  const isGroupSyncing = syncingGroup === groupKey;

  const handleGroupSync = (e) => {
    e.stopPropagation();
    const perms = pendingInGroup.map(({ name }) => {
      const def = allDefinitions.find((d) => d.name === name);
      return { name, description: def?.description || name };
    });
    onSyncGroup(groupKey, perms);
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-3 px-4 py-3 text-left"
        >
          <ShieldCheck size={16} className="text-violet-500 shrink-0" />
          <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
            {group.name}
          </span>
          <span
            className={classNames(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              definedCount === total
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
            )}
          >
            {definedCount}/{total}
          </span>
        </button>
        <div className="flex items-center gap-1 pr-3">
          {pendingInGroup.length > 0 && (
            <button
              type="button"
              onClick={handleGroupSync}
              disabled={isGroupSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white transition-colors"
              title={`Sincronizar ${pendingInGroup.length} permiso(s) de este grupo`}
            >
              {isGroupSyncing ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Layers size={11} />
              )}
              {isGroupSyncing ? 'Creando...' : `+${pendingInGroup.length}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-400 transition-colors"
          >
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {permissionsWithStatus.map(({ name, dbRecord }) => (
            <div
              key={name}
              className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-neutral-900"
            >
              {editingId === dbRecord?.id ? (
                /* ---- inline edit row ---- */
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    className="flex-1 text-sm border border-violet-400 rounded-md px-2 py-1 bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={editValues.description}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descripción"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
                      title="Guardar"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="p-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-violet-600 dark:text-violet-400 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {dbRecord?.description || (
                        <span className="italic opacity-60">
                          Sin descripción en BD
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge inDb={!!dbRecord} />
                    {!dbRecord ? (
                      <button
                        type="button"
                        onClick={() => {
                          const def = allDefinitions.find(
                            (d) => d.name === name,
                          );
                          onCreateSingle(name, def?.description || name);
                        }}
                        disabled={creatingSingle === name}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors"
                        title="Crear este permiso en la BD"
                      >
                        {creatingSingle === name ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Plus size={11} />
                        )}
                        Crear
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(dbRecord)}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-violet-500"
                          title="Editar descripción"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(dbRecord)}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500"
                          title="Eliminar permiso"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Modal                                                           */
/* ------------------------------------------------------------------ */
const PermissionsManagerModal = ({ isOpen, onClose }) => {
  const {
    permissions: dbPermissions,
    useGetPermissions,
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
    useSyncPermissions,
  } = usePermissionContext();

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ description: '' });
  const [syncing, setSyncing] = useState(false);
  const [syncingGroup, setSyncingGroup] = useState(null); // groupKey being synced
  const [creatingSingle, setCreatingSingle] = useState(null); // permission name being created
  const [activeTab, setActiveTab] = useState('defined'); // 'defined' | 'custom' | 'custom-new'

  // New permission form
  const [newPerm, setNewPerm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const allDefinitions = useMemo(() => getAllPermissionDefinitions(), []);

  useEffect(() => {
    if (isOpen) useGetPermissions();
  }, [isOpen]);

  /* Permissions in DB that are NOT in any PermissionsByGroup definition */
  const definedNames = useMemo(() => {
    const names = new Set();
    Object.values(PermissionsByGroup).forEach((g) =>
      g.permissions.forEach((n) => names.add(n)),
    );
    return names;
  }, []);

  const orphanedPermissions = useMemo(
    () => dbPermissions.filter((p) => !definedNames.has(p.name)),
    [dbPermissions, definedNames],
  );

  /* Sync all definitions to DB */
  const handleSync = async () => {
    setSyncing(true);
    try {
      await useSyncPermissions(allDefinitions);
      await useGetPermissions();
    } catch (e) {
      Notifies('error', 'Error al sincronizar permisos');
    } finally {
      setSyncing(false);
    }
  };

  /* Sync only pending permissions of one group */
  const handleSyncGroup = async (groupKey, perms) => {
    if (!perms.length) return;
    setSyncingGroup(groupKey);
    try {
      await useSyncPermissions(perms);
      await useGetPermissions();
    } catch {
      Notifies('error', 'Error al sincronizar el grupo');
    } finally {
      setSyncingGroup(null);
    }
  };

  /* Create a single permission by name+description */
  const handleCreateSingle = async (name, description) => {
    setCreatingSingle(name);
    try {
      await useCreatePermission({ name, description });
      await useGetPermissions();
    } catch {
      Notifies('error', `Error al crear el permiso "${name}"`);
    } finally {
      setCreatingSingle(null);
    }
  };

  /* Edit permission description */
  const handleEdit = (dbRecord) => {
    setEditingId(dbRecord.id);
    setEditValues({ description: dbRecord.description || '' });
  };

  const handleSaveEdit = async () => {
    try {
      await useUpdatePermission({ id: editingId, ...editValues });
      await useGetPermissions();
      setEditingId(null);
    } catch {
      Notifies('error', 'Error al actualizar permiso');
    }
  };

  /* Delete permission */
  const handleDelete = async (dbRecord) => {
    if (
      !window.confirm(
        `¿Eliminar el permiso "${dbRecord.name}"? Se eliminará de todos los roles que lo tengan asignado.`,
      )
    )
      return;
    try {
      await useDeletePermission(dbRecord.id);
      await useGetPermissions();
    } catch {
      Notifies('error', 'Error al eliminar permiso');
    }
  };

  /* Create custom permission */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPerm.name.trim()) {
      Notifies('error', 'El nombre del permiso es requerido');
      return;
    }
    setCreating(true);
    try {
      await useCreatePermission(newPerm);
      await useGetPermissions();
      setNewPerm({ name: '', description: '' });
    } catch {
      Notifies('error', 'Error al crear permiso');
    } finally {
      setCreating(false);
    }
  };

  /* Stats */
  const syncedCount = allDefinitions.filter((d) =>
    dbPermissions.some((p) => p.name === d.name),
  ).length;
  const pendingCount = allDefinitions.length - syncedCount;

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="relative w-full max-w-3xl max-h-[90dvh] flex flex-col bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <ShieldCheck
                size={20}
                className="text-violet-600 dark:text-violet-400"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Gestión de Permisos
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {syncedCount} sincronizados · {pendingCount} pendientes ·{' '}
                {orphanedPermissions.length} personalizados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- Tabs ---- */}
        <div className="flex gap-1 px-6 pt-3 shrink-0 border-b border-neutral-200 dark:border-neutral-700">
          {[
            { key: 'defined', label: 'Definidos por módulo' },
            {
              key: 'custom',
              label: `Personalizados (${orphanedPermissions.length})`,
            },
            { key: 'custom-new', label: 'Nuevo permiso' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={classNames(
                'px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px',
                activeTab === tab.key
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---- Content ---- */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* TAB: Defined by module */}
          {activeTab === 'defined' && (
            <>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Los permisos marcados como{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Pendiente
                  </span>{' '}
                  no existen aún en la base de datos. Usa el botón{' '}
                  <strong>Sincronizar</strong> para crearlos automáticamente.
                </p>
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing || pendingCount === 0}
                  className={classNames(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ml-4',
                    pendingCount === 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm',
                    syncing && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <RefreshCw
                    size={13}
                    className={syncing ? 'animate-spin' : ''}
                  />
                  {syncing
                    ? 'Sincronizando...'
                    : pendingCount === 0
                      ? '¡Todo sincronizado!'
                      : `Sincronizar (${pendingCount})`}
                </button>
              </div>

              {Object.entries(PermissionsByGroup).map(([key, group]) => (
                <GroupSection
                  key={key}
                  groupKey={key}
                  group={group}
                  dbPermissions={dbPermissions}
                  editingId={editingId}
                  editValues={editValues}
                  setEditValues={setEditValues}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onSyncGroup={handleSyncGroup}
                  onCreateSingle={handleCreateSingle}
                  syncingGroup={syncingGroup}
                  creatingSingle={creatingSingle}
                  allDefinitions={allDefinitions}
                />
              ))}
            </>
          )}

          {/* TAB: Custom / orphaned */}
          {activeTab === 'custom' && (
            <>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Permisos que existen en la base de datos pero no están definidos
                en ningún módulo del sistema.
              </p>
              {orphanedPermissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-600">
                  <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
                  <p className="text-sm">No hay permisos personalizados</p>
                </div>
              ) : (
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-700 overflow-hidden">
                  {orphanedPermissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-neutral-900"
                    >
                      {editingId === perm.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            className="flex-1 text-sm border border-violet-400 rounded-md px-2 py-1 bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            value={editValues.description}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Descripción"
                          />
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-violet-600 dark:text-violet-400 truncate">
                              {perm.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {perm.description || (
                                <span className="italic opacity-60">
                                  Sin descripción
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEdit(perm)}
                              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-violet-500"
                              title="Editar descripción"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(perm)}
                              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500"
                              title="Eliminar permiso"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: Create new permission */}
          {activeTab === 'custom-new' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Crea un permiso personalizado que no está definido en ningún
                módulo. Podrás asignarlo a roles manualmente desde la vista de
                permisos del rol.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nombre del permiso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: view_reports, export_csv"
                    value={newPerm.name}
                    onChange={(e) =>
                      setNewPerm((v) => ({
                        ...v,
                        name: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '_')
                          .replace(/[^a-z0-9_]/g, ''),
                      }))
                    }
                    className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Solo letras minúsculas, números y guion bajo.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Ver reportes del sistema"
                    value={newPerm.description}
                    onChange={(e) =>
                      setNewPerm((v) => ({ ...v, description: e.target.value }))
                    }
                    className="w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creating || !newPerm.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <PackagePlus size={15} />
                {creating ? 'Creando...' : 'Crear permiso'}
              </button>
            </form>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagerModal;
