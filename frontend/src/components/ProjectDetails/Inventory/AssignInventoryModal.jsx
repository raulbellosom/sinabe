import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useInventoryAssignments } from '../../../hooks/useInventoryAssignments';
import { searchInventories } from '../../../services/api';
import ImageViewer from '../../ImageViewer/ImageViewer';

const AssignInventoryModal = ({ isOpen, onClose, deadlineId, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { assignInventory, isAssigning } = useInventoryAssignments(deadlineId);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchInventories({ searchTerm });
      const enabled = (result?.data || []).filter((i) => i.enabled);
      setSearchResults(enabled);
    } catch (error) {
      console.error('Error buscando inventarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearchResults([]);
      setSearchTerm('');
      setQuantities({});
    }
  }, [isOpen]);

  const groupByType = (inventories) => {
    const grouped = {};
    for (const inv of inventories) {
      const type = inv.model?.type?.name || 'Sin tipo';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(inv);
    }
    return grouped;
  };

  const groupedInventories = groupByType(searchResults);

  const handleAssign = (inventoryId) => {
    const quantity = parseInt(quantities[inventoryId]) || 1;
    assignInventory(
      { deadlineId, inventoryId, quantity },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-6xl rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800">
              Asignar Inventarios
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
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
              onClick={handleSearch}
              className="bg-sinabe-primary hover:bg-sinabe-secondary text-white px-4 py-2 rounded-md"
            >
              Buscar
            </button>
          </form>

          {loading ? (
            <div className="text-center text-gray-500 py-6">
              Cargando resultados...
            </div>
          ) : Object.keys(groupedInventories).length === 0 ? (
            <div className="text-center text-gray-400 py-6">Sin resultados</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedInventories).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {type}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((inv) => (
                      <div
                        key={inv.id}
                        className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                      >
                        <ImageViewer images={inv.images || []} />
                        <div className="font-semibold text-gray-800">
                          {inv.model?.name} – {inv.model?.brand?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Folio: {inv.internalFolio || '—'}
                        </div>
                        <div className="flex flex-wrap gap-2 my-2">
                          {inv.condition && (
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                              {inv.condition.name}
                            </span>
                          )}
                          {inv.status === 'INSTALADO' && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md">
                              Instalado
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min={1}
                            className="border px-2 py-1 rounded-md w-20"
                            value={quantities[inv.id] || ''}
                            onChange={(e) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [inv.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            onClick={() => handleAssign(inv.id)}
                            disabled={isAssigning}
                            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-md"
                          >
                            <FaPlus /> Asignar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AssignInventoryModal;
