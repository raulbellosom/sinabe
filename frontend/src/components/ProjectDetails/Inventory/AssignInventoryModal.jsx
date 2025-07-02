// File: src/components/ProjectDetails/Inventory/AssignInventoryModal.jsx
import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { MdInventory, MdRemoveCircle } from 'react-icons/md';
import ReusableTable from '../../Table/ReusableTable';
import InventorySearchInput from '../../InventoryComponents/InventorySearchInput';
import {
  useInventoryAssignments,
  useAssignInventoryToDeadline,
  useRemoveInventoryFromDeadline,
} from '../../../hooks/useInventoryAssignments';
import Notifies from '../../Notifies/Notifies';
import SideModal from '../../Modals/SideModal';
import ConfirmRemoveInventoryModal from './ConfirmRemoveInventoryModal';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Card from '../../Card/Card';

const AssignInventoryModal = ({ isOpen, onClose, deadlineId, onUpdate }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inventoryToRemove, setInventoryToRemove] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { data = [], isLoading } = useInventoryAssignments(deadlineId);
  const assignMutation = useAssignInventoryToDeadline(deadlineId);
  const removeMutation = useRemoveInventoryFromDeadline(deadlineId);

  const tableData = data.map((a) => ({
    ...a.inventory,
    assignmentId: a.id, // necesario para eliminar
  }));

  const handleAssign = async (inventoryId) => {
    try {
      await assignMutation.mutateAsync({ inventoryId });
      Notifies('success', 'Inventario asignado correctamente');
      onUpdate?.();
    } catch {
      Notifies('error', 'No se pudo asignar el inventario');
    }
  };

  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync({ assignmentId: inventoryToRemove });

      Notifies('success', 'Inventario removido correctamente');
      onUpdate?.();
    } catch {
      Notifies('error', 'No se pudo eliminar el inventario');
    } finally {
      setInventoryToRemove(null);
      setShowConfirmModal(false);
    }
  };

  const columns = [
    {
      key: 'image',
      title: 'Imagen',
      render: (_, row) =>
        row.images?.[0] ? (
          <img
            src={`/${row.images[0].thumbnail}`}
            alt="thumbnail"
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          '—'
        ),
    },
    {
      key: 'model.name',
      title: 'Modelo',
      render: (_, row) => row.model?.name || '—',
    },
    {
      key: 'model.brand.name',
      title: 'Marca',
      render: (_, row) => row.model?.brand?.name || '—',
    },
    {
      key: 'model.type.name',
      title: 'Tipo',
      render: (_, row) => row.model?.type?.name || '—',
    },
    {
      key: 'serialNumber',
      title: 'N° Serie',
    },
    {
      key: 'activeNumber',
      title: 'N° Activo',
    },
    {
      key: 'internalFolio',
      title: 'Folio Interno',
    },
    {
      key: 'status',
      title: 'Estado',
    },
    {
      key: 'actions',
      title: 'Acciones',
    },
  ];

  return (
    <>
      <SideModal
        isOpen={isOpen}
        onClose={onClose}
        title="Inventarios asignados a la deadline"
        icon={MdInventory}
        size="xl"
        className="mt-4 ml-4"
      >
        <div className="space-y-6 text-nowrap">
          {/* Buscador de inventarios */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Buscar inventarios para asignar:
            </label>
            <InventorySearchInput onSelect={(inv) => handleAssign(inv.id)} />
          </div>

          {/* Tabla de asignados */}
          {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tableData.map((inventory) => {
                const data = {
                  image: { key: 'Imagen', value: inventory?.images },
                  title: { key: 'Inventario', value: inventory?.model?.name },
                  subtitle: {
                    key: 'Marca y Tipo',
                    value: `${inventory?.model?.brand?.name} ${inventory?.model?.type?.name}`,
                  },
                  status: { key: 'Estado', value: inventory.status },
                  internalFolio: {
                    key: 'Folio interno',
                    value: inventory?.internalFolio || 'Sin folio',
                  },
                  tags: {
                    key: 'Condiciones',
                    value: inventory?.conditions?.map((c) => (
                      <span key={c.id}>{c?.condition?.name}</span>
                    )),
                  },
                  serialNumber: {
                    key: 'Número de serie',
                    value: inventory?.serialNumber,
                  },
                  activeNumber: {
                    key: 'Número de activo',
                    value: inventory?.activeNumber,
                  },
                  createdAt: {
                    key: 'Creado',
                    value: inventory?.createdAt,
                  },
                };

                return (
                  <div
                    key={inventory.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 flex flex-col justify-between relative"
                  >
                    <Card data={data} showImage />
                    <div className="flex items-center justify-end mt-4">
                      <Link
                        to={`/inventories/view/${inventory.id}`}
                        className="text-sm px-4 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 flex gap-2 items-center"
                      >
                        <FaEye size={16} />
                        Ver
                      </Link>
                      <span className="mx-2 text-gray-400">|</span>
                      <button
                        onClick={() => {
                          setInventoryToRemove(inventory.assignmentId);
                          setShowConfirmModal(true);
                        }}
                        className="text-sm px-4 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 flex gap-2 items-center"
                      >
                        <MdRemoveCircle size={16} />
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ReusableTable
              columns={columns}
              data={tableData}
              loading={isLoading}
              rowKey="id"
              enableCardView={false}
              showPagination={false}
              rowActions={(row) => [
                {
                  key: 'main',
                  icon: FaEye,
                  label: 'Ver',
                  action: () => navigate(`/inventories/view/${row.id}`),
                },
                {
                  key: 'remove',
                  icon: MdRemoveCircle,
                  label: 'Remover',
                  color: 'red',
                  action: () => {
                    setInventoryToRemove(row.assignmentId);
                    setShowConfirmModal(true);
                  },
                },
              ]}
            />
          )}
        </div>
      </SideModal>

      {/* Modal de confirmación para remover */}
      <ConfirmRemoveInventoryModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleRemove}
        title="Remover Inventario"
        message="¿Estás seguro de que deseas remover este inventario de la fecha límite? Esta acción no se puede deshacer."
        confirmText="Remover"
        confirmColor="red"
      />
    </>
  );
};

export default AssignInventoryModal;
