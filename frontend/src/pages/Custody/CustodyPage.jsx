import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Spinner,
  TextInput,
  Badge,
  Tooltip,
  Modal,
  Label,
  Button,
} from 'flowbite-react';
import {
  FaFileInvoice,
  FaSearch,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaQrcode,
  FaShareAlt,
} from 'react-icons/fa';
import { HiEye } from 'react-icons/hi';
import {
  getCustodyRecords,
  deleteCustodyRecord,
  resendCustodyEmail,
  getPublicLink,
} from '../../services/custody.api';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrum/Breadcrumb';
import FileIcon from '../../components/FileIcon/FileIcon';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { parseToLocalDate } from '../../utils/formatValues';
import ReusableTable from '../../components/Table/ReusableTable';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';

const CustodyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [isGettingLink, setIsGettingLink] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['custody-records', query],
    queryFn: () => getCustodyRecords(query),
    keepPreviousData: true,
  });

  const records = response?.data || [];
  const pagination = response?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCustodyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries(['custody-records']);
    },
    onError: (error) => {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el resguardo');
    },
  });

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleResendEmail = async (id) => {
    try {
      await resendCustodyEmail(id);
      toast.success('Correo reenviado exitosamente');
    } catch (error) {
      toast.error('Error al reenviar correo');
    }
  };

  const handleShowShare = async (id) => {
    setIsGettingLink(true);
    try {
      const data = await getPublicLink(id);
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const token = data.publicToken || data.publicLink?.split('/').pop();
      const fixedLink = `${baseUrl}/custody/public/${token}`;

      setShareData({ ...data, publicLink: fixedLink });
      setShowShareModal(true);
    } catch (error) {
      toast.error('Error al obtener enlace público');
    } finally {
      setIsGettingLink(false);
    }
  };

  const breadcrumbs = [
    { label: 'Inicio', path: '/' },
    { label: 'Resguardos', path: '/custody' },
  ];

  const columns = useMemo(
    () => [
      {
        key: 'date',
        title: 'Fecha',
        render: (val) => parseToLocalDate(val),
        sortable: true,
      },
      {
        key: 'receiver',
        title: 'Receptor',
        render: (val) => (val ? `${val.firstName} ${val.lastName}` : 'N/A'),
        sortable: true,
      },
      {
        key: 'employeeNumber',
        title: 'No. Empleado',
        render: (_, row) => row.receiver?.employeeNumber || 'N/A',
        sortable: true,
      },
      {
        key: 'deliverer',
        title: 'Entregado Por',
        render: (val) => (val ? `${val.firstName} ${val.lastName}` : 'N/A'),
        sortable: true,
      },
      {
        key: 'receiverSignature',
        title: 'Firmado',
        render: (val) =>
          val ? (
            <div className="flex justify-center text-green-500">
              <Tooltip content="Resguardo firmado">
                <FaCheckCircle className="h-5 w-5" />
              </Tooltip>
            </div>
          ) : (
            <div className="flex justify-center text-gray-300">
              <Tooltip content="Pendiente de firma">
                <FaTimesCircle className="h-5 w-5" />
              </Tooltip>
            </div>
          ),
      },
      {
        key: 'items',
        title: 'Equipos',
        render: (val) => (
          <Badge color="info" className="w-fit">
            {val ? val.length : 0} Equipos
          </Badge>
        ),
      },
      {
        key: 'file',
        title: 'Archivo',
        render: (val) =>
          val ? (
            <div className="w-48">
              <FileIcon
                file={{
                  ...val,
                  name: 'Ver PDF',
                  type: 'application/pdf',
                }}
              />
            </div>
          ) : (
            '-'
          ),
      },
      {
        key: 'status',
        title: 'Estado',
        render: (val) => {
          const isDraft = val === 'BORRADOR';
          return (
            <Badge color={isDraft ? 'warning' : 'info'} className="w-fit">
              {isDraft ? 'Borrador' : 'Completado'}
            </Badge>
          );
        },
        sortable: true,
      },
      {
        key: 'actions',
        title: 'Acciones',
      },
    ],
    [],
  );

  const handleSort = (key) => {
    setQuery((prev) => {
      const isSameKey = prev.sortBy === key;
      const newOrder = isSameKey && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: key, sortOrder: newOrder };
    });
  };

  const rowActions = (record) => [
    {
      key: 'view',
      label: 'Ver Detalle',
      icon: HiEye,
      action: () => navigate(`/custody/view/${record.id}`),
      color: 'green',
    },
    {
      key: 'share',
      label: 'QR / Enlace',
      icon: FaQrcode,
      action: () => handleShowShare(record.id),
      color: 'blue',
    },
    ...(record.status === 'BORRADOR'
      ? [
          {
            key: 'edit',
            label: 'Editar Borrador',
            icon: FaEdit,
            action: () => navigate(`/custody/edit/${record.id}`),
            color: 'yellow',
          },
        ]
      : []),
    ...(record.status === 'COMPLETADO'
      ? [
          {
            key: 'resend',
            label: 'Enviar Correo',
            icon: FaEnvelope,
            action: () => handleResendEmail(record.id),
            color: 'green',
          },
        ]
      : []),
    {
      key: 'delete',
      label: 'Eliminar',
      icon: FaTrash,
      action: () => handleDelete(record),
      color: 'red',
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-10 text-center">
        Error al cargar los resguardos. Por favor intente de nuevo.
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaFileInvoice className="text-purple-500" />
          Resguardos Tecnológicos
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="w-full md:w-96">
            <TextInput
              id="search"
              type="text"
              icon={FaSearch}
              placeholder="Buscar por nombre, empleado, serie, modelo..."
              value={query.searchTerm}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>
          <ActionButtons
            onCreate={() => navigate('/custody/create')}
            labelCreate="Nuevo Resguardo"
          />
        </div>
      </div>

      <ReusableTable
        columns={columns}
        data={records}
        pagination={pagination}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setQuery((prev) => ({ ...prev, pageSize, page: 1 }))
        }
        sortConfig={{ key: query.sortBy, direction: query.sortOrder }}
        onSort={handleSort}
        rowActions={rowActions}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={
          recordToDelete
            ? `Resguardo de ${recordToDelete.receiver?.firstName} ${recordToDelete.receiver?.lastName}`
            : 'Resguardo'
        }
        itemType="resguardo"
      />

      {/* Share Modal */}
      <Modal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        size="md"
      >
        <Modal.Header>Verificación Pública</Modal.Header>
        <Modal.Body>
          <div className="text-center space-y-4">
            <p className="text-gray-500 text-sm">
              Escanea este código o comparte el enlace para la firma digital o
              verificación externa (24h de validez).
            </p>
            {shareData?.publicLink && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG value={shareData.publicLink} size={180} />
                </div>
                <div className="w-full">
                  <Label htmlFor="shareLink" className="mb-2 block text-left">
                    Link:
                  </Label>
                  <div className="flex gap-2">
                    <TextInput
                      id="shareLink"
                      value={shareData.publicLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      color="light"
                      onClick={() => {
                        navigator.clipboard.writeText(shareData.publicLink);
                        toast.success('Copiado');
                      }}
                    >
                      <FaShareAlt />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowShareModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustodyPage;
