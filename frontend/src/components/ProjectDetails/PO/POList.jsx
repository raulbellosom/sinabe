// src/components/ProjectDetails/PO/POList.jsx
import React from 'react';
import POCard from './POCard';

/**
 * POList recibe un array de órdenes de compra y renderiza una POCard por cada una.
 */
const POList = ({ purchaseOrders }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {purchaseOrders.map((order) => (
        <POCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default POList;
