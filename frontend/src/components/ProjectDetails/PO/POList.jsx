// src/components/ProjectDetails/PO/POList.jsx
import React from 'react';
import POCard from './POCard';

/**
 * POList recibe un array de órdenes de compra y renderiza
 * una POCard por cada una, pasándole también la prop onEdit.
 */
const POList = ({ purchaseOrders, onEdit }) => {
  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      {purchaseOrders.map((order) => (
        <POCard
          key={order.id}
          order={order}
          onEdit={onEdit} // Le paso la función para abrir el modal de edición
        />
      ))}
    </div>
  );
};

export default POList;
