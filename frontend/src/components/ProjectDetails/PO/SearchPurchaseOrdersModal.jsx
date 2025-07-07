// src/components/Projects/SearchPurchaseOrdersModal.jsx
import React, { useState, useEffect } from 'react';
import ReusableModal from '../../Modals/ReusableModal';
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
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, doSearch]);

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
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaSearch className="text-gray-500" /> Buscar órdenes no asignadas
        </span>
      }
      size="md"
    >
      <input
        type="text"
        placeholder="Buscar por código, factura, inventario, modelo o concepto..."
        className="w-full px-4 py-2 rounded border text-sm dark:bg-gray-800 dark:text-white mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="min-h-[120px]">
        {isPending ? (
          <Skeleton count={4} />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">Sin resultados</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {filtered.map((order) => (
              <li
                key={order.id}
                className="flex justify-between items-center py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded"
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
    </ReusableModal>
  );
};

export default SearchPurchaseOrdersModal;
