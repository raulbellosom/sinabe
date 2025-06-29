import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaSearch, FaFileInvoice } from 'react-icons/fa';
import {
  useSearchUnassignedPurchaseOrders,
  useAssignPurchaseOrderToProject,
} from '../../../hooks/usePurchaseOrders';
import Notifies from '../../Notifies/Notifies';
import Skeleton from 'react-loading-skeleton';

const SearchPurchaseOrdersModal = ({ isOpen, onClose, projectId }) => {
  const { mutate: doSearch, isPending } = useSearchUnassignedPurchaseOrders();
  const { mutate: assignToProject } =
    useAssignPurchaseOrderToProject(projectId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);

  // ⏱️ Debounce de búsqueda automática
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered([]);
      return;
    }

    const delay = setTimeout(() => {
      doSearch(searchTerm, {
        onSuccess: setFiltered,
        onError: () => Notifies('error', 'Error al buscar órdenes'),
      });
    }, 400); // 400ms de espera

    return () => clearTimeout(delay); // Limpia timeout anterior
  }, [searchTerm]);

  const handleAssign = (orderId) => {
    assignToProject(orderId, {
      onSuccess: () => {
        Notifies('success', 'Orden asignada correctamente');
        setFiltered((prev) => prev.filter((o) => o.id !== orderId));
      },
      onError: () => Notifies('error', 'No se pudo asignar la orden'),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="z-50 relative">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl p-6 space-y-4 shadow-xl">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <FaSearch className="text-gray-500" />
            Buscar órdenes no asignadas
          </DialogTitle>

          <input
            type="text"
            placeholder="Buscar por código, factura, inventario, modelo o concepto..."
            className="w-full px-4 py-2 rounded border text-sm dark:bg-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="min-h-[120px]">
            {isPending ? (
              <Skeleton count={4} />
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                Sin resultados
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                {filtered.map((order) => (
                  <li
                    key={order.id}
                    className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded"
                  >
                    <div className="flex gap-3 items-center">
                      <FaFileInvoice className="text-indigo-600" />
                      <div>
                        <p className="font-medium text-sm">{order.code}</p>
                        <p className="text-xs text-gray-500">
                          {order.invoices?.length || 0} factura(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssign(order.id)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Añadir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SearchPurchaseOrdersModal;
