// src/components/ProjectDetails/ProjectPurchaseOrders.jsx
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaPlus, FaClipboardList, FaSearch } from 'react-icons/fa';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import ActionButtons from '../ActionButtons/ActionButtons';
import POList from './PO/POList';
import { PurchaseOrderFormModal } from './PO/PurchaseOrderModals';
import SearchPurchaseOrdersModal from './PO/SearchPurchaseOrdersModal';

const ProjectPurchaseOrders = ({ projectId }) => {
  const { data: orders, isLoading, error } = usePurchaseOrders(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton width={200} height={32} />
          <Skeleton circle width={40} height={40} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white shadow-lg p-6 space-y-4"
            >
              <Skeleton height={20} width="50%" />
              <Skeleton count={2} />
              <Skeleton height={16} width="40%" />
              <Skeleton height={32} width="100%" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-600">Error al cargar órdenes.</div>;
  }

  return (
    <section className="space-y-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-lg font-semibold">
          Órdenes de Compra
        </h2>
        <div className="flex items-center space-x-2">
          <ActionButtons
            extraActions={[
              {
                label: 'Buscar Órdenes',
                icon: FaSearch,
                color: 'blue',
                action: () => setIsSearchOpen(true),
              },
              {
                label: 'Agregar Orden',
                icon: FaPlus,
                color: 'indigo',
                action: () => {
                  setSelectedOrder(null); // modo creación
                  setIsOpen(true);
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Lista o mensaje */}
      <div className="">
        {orders && orders.length > 0 ? (
          <POList
            purchaseOrders={orders}
            onEdit={(order) => {
              setSelectedOrder(order); // modo edición
              setIsOpen(true);
            }}
          />
        ) : (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <FaClipboardList className="mx-auto text-4xl text-gray-300" />
            <p className="text-lg font-medium">
              Aún no tienes órdenes de compra creadas
            </p>
            <p className="text-sm">Haz click en “Agregar Orden” para empezar</p>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <PurchaseOrderFormModal
        projectId={projectId}
        order={selectedOrder} // null => creación, objeto => edición
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <SearchPurchaseOrdersModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projectId={projectId}
      />
    </section>
  );
};

export default ProjectPurchaseOrders;
