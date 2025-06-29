// pages/InvoicesPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaFileInvoice,
  FaFilePdf,
  FaFileCode,
} from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import { useDeleteInvoice, useSearchInvoices } from '../../hooks/useInvoices';
import ReusableTable from '../../components/Table/ReusableTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import InvoiceModal from '../../components/ProjectDetails/PO/InvoiceModal';
import SideModal from '../../components/Modals/SideModal';
import InvoiceInventoryManager from '../../components/purchaseOrders/invoices/InvoiceInventoryManager';
import { parseToLocalDate } from '../../utils/formatValues';
import { Badge } from 'flowbite-react';
import { useDebounce } from '../../hooks/useDebounce';
import { getFileUrl } from '../../utils/getFileUrl';

const statusColors = {
  PENDIENTE: 'yellow',
  PAGADA: 'green',
  ANULADA: 'red',
};

const InvoicesPage = () => {
  const { orderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const searchTerm = searchParams.get('searchTerm') || '';
  const modalId = searchParams.get('modalId') || null;

  const debouncedSearchTerm = useDebounce(searchTerm);

  const { data = {}, isLoading } = useSearchInvoices(orderId, {
    searchTerm: debouncedSearchTerm,
    page,
    pageSize,
  });

  const invoices = data.data || [];
  const pagination = data.pagination || {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
  };

  const deleteInvoice = useDeleteInvoice(orderId);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [invoiceToManageInventory, setInvoiceToManageInventory] =
    useState(null);

  const formattedInvoice = selectedInvoice
    ? {
        ...selectedInvoice,
        fileUrl: getFileUrl(selectedInvoice.fileUrl),
        xmlUrl: getFileUrl(selectedInvoice.xmlUrl),
      }
    : null;

  // Abrir modal desde query param
  useEffect(() => {
    if (modalId && invoices.length > 0) {
      const found = invoices.find((inv) => inv.id === modalId);
      if (found) {
        setInvoiceToManageInventory(found);
        setShowInventoryModal(true);
      }
    }
  }, [modalId, invoices]);

  const handleOpenInventoryModal = (inv) => {
    setInvoiceToManageInventory(inv);
    setShowInventoryModal(true);
    setSearchParams((prev) => {
      const copy = new URLSearchParams(prev);
      copy.set('modalId', inv.id);
      return copy;
    });
  };

  const handleCloseInventoryModal = () => {
    setShowInventoryModal(false);
    setInvoiceToManageInventory(null);
    setSearchParams((prev) => {
      const copy = new URLSearchParams(prev);
      copy.delete('modalId');
      return copy;
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        title: 'ID Factura',
        render: (code) => (
          <span className="text-nowrap font-semibold">{code}</span>
        ),
      },
      { key: 'concept', title: 'Concepto' },
      {
        key: 'amount',
        title: 'Monto',
        render: (amt) => `$${amt.toLocaleString('es-MX')}`,
      },
      {
        key: 'status',
        title: 'Estado',
        render: (status) => (
          <Badge
            color={statusColors[status] || 'gray'}
            className="uppercase px-2 py-1"
          >
            {status}
          </Badge>
        ),
      },
      {
        key: 'date',
        title: 'Fecha',
        render: (d) => parseToLocalDate(d, 'es-MX'),
      },
      {
        key: 'inventories',
        title: 'Inventarios',
        render: (_, row) => (
          <Badge
            size="sm"
            color="purple"
            className="text-center flex justify-center items-center"
          >
            {row.inventories?.length || 0}
          </Badge>
        ),
      },
      {
        key: 'fileUrl',
        title: 'Archivos',
        render: (_, row) => (
          <div className="flex gap-2">
            {row.fileUrl && (
              <a
                href={getFileUrl(row.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500"
              >
                <FaFilePdf size={20} />
              </a>
            )}
            {row.xmlUrl && (
              <a
                href={getFileUrl(row.xmlUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                <FaFileCode size={20} />
              </a>
            )}
          </div>
        ),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [],
  );

  return (
    <section className="space-y-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-sinabe-primary flex items-center gap-2">
          <FaFileInvoice /> Facturas de la Orden
        </h1>
        <ActionButtons
          extraActions={[
            {
              label: 'Nueva factura',
              icon: FaPlus,
              action: () => {
                setSelectedInvoice(null);
                setShowInvoiceModal(true);
              },
            },
          ]}
        />
      </div>

      {/* 🔎 Input de búsqueda */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar facturas, concepto..."
          defaultValue={searchTerm}
          onChange={(e) =>
            setSearchParams((prev) => {
              const copy = new URLSearchParams(prev);
              copy.set('searchTerm', e.target.value);
              copy.set('page', 1);
              return copy;
            })
          }
          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring focus:border-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <ReusableTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        pagination={pagination}
        onPageChange={(newPage) =>
          setSearchParams((prev) => {
            const copy = new URLSearchParams(prev);
            copy.set('page', newPage);
            return copy;
          })
        }
        onPageSizeChange={(size) =>
          setSearchParams((prev) => {
            const copy = new URLSearchParams(prev);
            copy.set('pageSize', size);
            copy.set('page', 1);
            return copy;
          })
        }
        rowActions={(inv) => [
          {
            key: 'main',
            icon: MdInventory,
            label: 'Inventarios',
            action: () => handleOpenInventoryModal(inv),
          },
          {
            key: 'edit',
            icon: FaEdit,
            label: 'Editar',
            action: () => {
              setSelectedInvoice(inv);
              setShowInvoiceModal(true);
            },
          },
          {
            key: 'delete',
            icon: FaTrashAlt,
            label: 'Eliminar',
            action: () => deleteInvoice.mutate(inv.id),
          },
        ]}
      />

      <InvoiceModal
        orderId={orderId}
        invoice={formattedInvoice}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onDelete={(invoiceId) => deleteInvoice.mutate(invoiceId)}
      />

      <SideModal
        isOpen={showInventoryModal}
        onClose={handleCloseInventoryModal}
        title={`Inventario de ${invoiceToManageInventory?.code || ''}`}
        icon={MdInventory}
        size="xl"
      >
        {invoiceToManageInventory && (
          <InvoiceInventoryManager
            invoiceId={invoiceToManageInventory.id}
            orderId={orderId}
          />
        )}
      </SideModal>
    </section>
  );
};

export default InvoicesPage;
