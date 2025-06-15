import React, { useMemo, useState } from 'react';
import GroupedInventoryView from './Inventory/GroupedInventoryView';
import {
  HiOutlineCollection,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineCube,
} from 'react-icons/hi';
import Skeleton from 'react-loading-skeleton';
import { useDeadlinesByProject } from '../../hooks/useDeadlines';

const GROUP_OPTIONS = [
  { label: 'Deadline', value: 'deadline', icon: <HiOutlineClipboardList /> },
  { label: 'Tipo de Inventario', value: 'type', icon: <HiOutlineCollection /> },
  { label: 'Marca', value: 'brand', icon: <HiOutlineTag /> },
  { label: 'Modelo', value: 'model', icon: <HiOutlineCube /> },
];

const ProjectInventory = ({ projectId }) => {
  const [groupBy, setGroupBy] = useState('deadline');

  // 🔍 Obtener todos los inventarios por proyecto (puedes extender esto si usas paginación o filtros)
  const { data: deadlines, isLoading } = useDeadlinesByProject(projectId);

  const inventories = useMemo(() => {
    if (!Array.isArray(deadlines)) return [];
    return deadlines.flatMap((dl) =>
      dl.inventoryAssignments.map((ia) => ({
        ...ia.inventory,
        deadline: { id: dl.id, title: dl.name }, // para seguir usando en la vista
      })),
    );
  }, [deadlines]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Inventario Detallado del Proyecto
        </h2>
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setGroupBy(option.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm
                ${
                  groupBy === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton height={300} />
      ) : (
        <GroupedInventoryView groupBy={groupBy} inventories={inventories} />
      )}
    </div>
  );
};

export default ProjectInventory;
