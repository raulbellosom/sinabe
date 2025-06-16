// AssignInventoryModal.jsx

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState, memo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { MdRemove } from 'react-icons/md';
import { BsBoxSeam } from 'react-icons/bs';
import { useInventoryAssignments } from '../../../hooks/useInventoryAssignments';
import { parseToLocalDate } from '../../../utils/formatValues';
import { useSearchInventories } from '../../../hooks/useSearchInventories';
import Card from '../../Card/Card';
import CustomTabs from '../CustomTabs';

const SearchAndAssignTab = ({
  data,
  deadlineId,
  pendingId,
  isLoading,
  isAssigning,
  isUnassigning,
  onAssign,
  onUnassign,
  searchTerm,
  setSearchTerm,
  refetch,
}) => {
  const groupByType = (inventories) => {
    const grouped = {};
    for (const inv of inventories) {
      const type = inv.model?.type?.name || 'Sin tipo';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(inv);
    }
    return grouped;
  };

  const groupedInventories = groupByType(data?.data || []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          refetch();
        }}
        className="mb-4 flex gap-2"
      >
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar inventarios..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-sinabe-primary hover:bg-sinabe-secondary text-white px-4 py-2 rounded-md"
        >
          Buscar
        </button>
      </form>

      {isLoading ? (
        <div className="text-center text-gray-500 py-6">
          Cargando resultados...
        </div>
      ) : Object.keys(groupedInventories).length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          <BsBoxSeam className="text-4xl mx-auto mb-2" />
          <p className="font-medium">Sin resultados</p>
          <p className="text-sm">
            Prueba con otra búsqueda, recuerda que puedes buscar entre modelo,
            tipo, marca y más.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedInventories).map(([type, items]) => (
            <div className="bg-gray-100 p-2 rounded-md" key={type}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {type}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((inventory) => {
                  const isAssigned = inventory.InventoryDeadline?.some(
                    (a) => a.deadlineId === deadlineId,
                  );
                  const assignmentId = inventory.InventoryDeadline?.find(
                    (a) => a.deadlineId === deadlineId,
                  )?.id;
                  const isPending = pendingId === inventory.id;

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
                    receptionDate: {
                      key: 'F. de recepción',
                      value: inventory?.receptionDate
                        ? parseToLocalDate(inventory?.receptionDate)
                        : '',
                    },
                    createdAt: {
                      key: 'Creacion / Modificación',
                      value: `${parseToLocalDate(inventory?.createdAt)} / ${parseToLocalDate(inventory?.updatedAt)}`,
                    },
                  };

                  return (
                    <div
                      key={inventory.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 flex flex-col justify-between relative"
                    >
                      <Card data={data} showImage />
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() =>
                            isAssigned
                              ? onUnassign(assignmentId, inventory.id)
                              : onAssign(inventory.id)
                          }
                          disabled={isAssigning || isUnassigning || isPending}
                          className={`text-sm px-4 py-1 rounded-md text-white flex gap-2 items-center w-fit ${
                            isAssigned
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {isPending ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <span>
                              {isAssigned ? (
                                <MdRemove size={16} />
                              ) : (
                                <FaPlus size={16} />
                              )}
                            </span>
                          )}
                          {isAssigned ? 'Remover' : 'Añadir'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const AssignedInventoriesTab = ({
  assignments,
  pendingId,
  isUnassigning,
  onUnassign,
  deadlineId,
}) => {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        <BsBoxSeam className="text-4xl mx-auto mb-2" />
        <p className="font-medium">No hay inventarios asignados</p>
        <p className="text-sm">
          Usa la pestaña de búsqueda para añadir inventarios
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {assignments.map(({ inventory, id: assignmentId }) => {
        const isPending = pendingId === inventory.id;

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
          receptionDate: {
            key: 'F. de recepción',
            value: inventory?.receptionDate
              ? parseToLocalDate(inventory?.receptionDate)
              : '',
          },
          createdAt: {
            key: 'Creacion / Modificación',
            value: `${parseToLocalDate(inventory?.createdAt)} / ${parseToLocalDate(inventory?.updatedAt)}`,
          },
        };

        return (
          <div
            key={inventory.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 flex flex-col justify-between relative"
          >
            <Card data={data} showImage />
            <div className="flex items-center justify-end mt-2">
              <button
                onClick={() => onUnassign(assignmentId, inventory.id)}
                disabled={isUnassigning || isPending}
                className="text-sm px-4 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 flex gap-2 items-center w-fit"
              >
                {isPending ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <MdRemove size={16} />
                )}
                Remover
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssignInventoryModal = ({ isOpen, onClose, deadlineId, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const {
    assignments,
    assignInventory,
    unassignInventory,
    isAssigning,
    isUnassigning,
  } = useInventoryAssignments(deadlineId);

  const { data, isLoading, refetch } = useSearchInventories({
    searchTerm,
    deadlineId,
  });

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setPendingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      refetch();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAssign = (inventoryId) => {
    setPendingId(inventoryId);
    assignInventory(
      { deadlineId, inventoryId },
      {
        onSuccess: () => {
          refetch();
          onUpdate?.();
          setPendingId(null);
        },
        onError: () => setPendingId(null),
      },
    );
  };

  const handleUnassign = (assignmentId, inventoryId) => {
    setPendingId(inventoryId);
    unassignInventory(assignmentId, {
      onSuccess: () => {
        refetch();
        onUpdate?.();
        setPendingId(null);
      },
      onError: () => setPendingId(null),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 h-[98dvh] overflow-y-auto">
        <DialogPanel className="bg-white w-full max-w-6xl rounded-xl p-6 shadow-2xl h-full overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800">
              Inventarios del Deadline
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          <CustomTabs
            tabs={[
              {
                title: 'Asignados',
                icon: BsBoxSeam,
                content: (
                  <AssignedInventoriesTab
                    assignments={assignments}
                    deadlineId={deadlineId}
                    pendingId={pendingId}
                    isUnassigning={isUnassigning}
                    onUnassign={handleUnassign}
                  />
                ),
              },
              {
                title: 'Buscar y Asignar',
                icon: FaPlus,
                content: (
                  <SearchAndAssignTab
                    data={data}
                    deadlineId={deadlineId}
                    pendingId={pendingId}
                    isLoading={isLoading}
                    isAssigning={isAssigning}
                    isUnassigning={isUnassigning}
                    onAssign={handleAssign}
                    onUnassign={handleUnassign}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    refetch={refetch}
                  />
                ),
              },
            ]}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default memo(AssignInventoryModal);
