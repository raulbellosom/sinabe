// src/components/ProjectDetails/PO/InvoiceList.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Table } from 'flowbite-react';
import InvoiceItem from './InvoiceItem';

const InvoiceList = ({ invoices, orderId, loading = false }) => {
  if (loading) {
    // Tres filas de esqueleto
    return (
      <div className="overflow-x-auto">
        <Table hoverable className="min-w-full">
          <Table.Head className="bg-gray-100">
            <Table.HeadCell>Código</Table.HeadCell>
            <Table.HeadCell>Concepto</Table.HeadCell>
            <Table.HeadCell>Monto</Table.HeadCell>
            <Table.HeadCell>Fecha</Table.HeadCell>
            <Table.HeadCell className="text-right">Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton width={80} />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton width={60} />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton width={100} />
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Skeleton width={24} height={24} circle />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="py-4 text-center text-gray-500 italic">
        Sin facturas asociadas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable className="min-w-full">
        <Table.Head className="bg-gray-100">
          <Table.HeadCell>Código</Table.HeadCell>
          <Table.HeadCell>Concepto</Table.HeadCell>
          <Table.HeadCell>Monto</Table.HeadCell>
          <Table.HeadCell>Fecha</Table.HeadCell>
          <Table.HeadCell className="text-right">Acciones</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {invoices.map((inv) => (
            <InvoiceItem key={inv.id} invoice={inv} orderId={orderId} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default InvoiceList;
