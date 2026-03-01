import { useState, useMemo, useEffect, useRef } from 'react';
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
} from '../../components/ui/flowbite';
import {
  getCustodyRecords,
  deleteCustodyRecord,
  resendCustodyEmail,
  getPublicLink,
} from '../../services/custody.api';
import { downloadFile } from '../../services/api';
import { getFileUrl } from '../../utils/getFileUrl';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import LoadingModal from '../../components/loadingModal/LoadingModal';
import Breadcrumb from '../../components/Breadcrum/Breadcrumb';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { parseToLocalDate } from '../../utils/formatValues';
import ReusableTable from '../../components/Table/ReusableTable';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';

import {
  CheckCircle,
  Download,
  Eye,
  FileText,
  Mail,
  MoreVertical,
  Pencil,
  QrCode,
  Search,
  Share2,
  Trash2,
  XCircle,
} from 'lucide-react';

// Component for PDF button with dropdown
const PdfFileButton = ({ file }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const fileUrl = getFileUrl(file?.url || file?.path || file);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 50;
    const top =
      spaceBelow >= menuHeight ? rect.bottom + 4 : rect.top - menuHeight - 4;
    let left = rect.right - 140;
    if (left < 8) left = 8;
    setMenuPos({ top, left });
    setMenuOpen((prev) => !prev);
  };

  const handleView = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) return;
    setIsDownloading(true);
    setMenuOpen(false);
    try {
      await downloadFile(fileUrl);
      toast.success('Archivo descargado');
    } catch (error) {
      toast.error('Error al descargar el archivo');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleView}
        className="flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/25"
      >
        <FileText size={16} />
        Ver PDF
      </button>
      <button
        ref={btnRef}
        type="button"
        onClick={openMenu}
        disabled={isDownloading}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--foreground-muted)] transition-colors hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
      >
        {isDownloading ? <Spinner size="sm" /> : <MoreVertical size={18} />}
      </button>
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[140px] rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] py-1 shadow-lg"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
          >
            <Download size={16} />
            Descargar
          </button>
        </div>
      )}
    </div>
  );
};

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
  const [localSearchTerm, setLocalSearchTerm] = useState(query.searchTerm);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((prev) => ({ ...prev, searchTerm: localSearchTerm, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [isGettingLink, setIsGettingLink] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const {
    data: response,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ['custody-records', query],
    queryFn: () => getCustodyRecords(query),
    placeholderData: (previousData) => previousData,
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
    setIsResendingEmail(true);
    try {
      await resendCustodyEmail(id);
      toast.success('Correo reenviado exitosamente');
    } catch (error) {
      toast.error('Error al reenviar correo');
    } finally {
      setIsResendingEmail(false);
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
                <CheckCircle className="h-5 w-5" />
              </Tooltip>
            </div>
          ) : (
            <div className="flex justify-center text-gray-300">
              <Tooltip content="Pendiente de firma">
                <XCircle className="h-5 w-5" />
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
        render: (val) => (val ? <PdfFileButton file={val} /> : '-'),
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
      icon: Eye,
      action: () => navigate(`/custody/view/${record.id}`),
      color: 'green',
    },
    ...(record.status === 'BORRADOR'
      ? [
          {
            key: 'share',
            label: 'QR / Enlace',
            icon: QrCode,
            action: () => handleShowShare(record.id),
            color: 'blue',
          },
          {
            key: 'edit',
            label: 'Editar Borrador',
            icon: Pencil,
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
            icon: Mail,
            action: () => handleResendEmail(record.id),
            color: 'green',
          },
        ]
      : []),
    {
      key: 'delete',
      label: 'Eliminar',
      icon: Trash2,
      action: () => handleDelete(record),
      color: 'red',
    },
  ];

  if (isLoading && !response)
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
      <LoadingModal
        loading={isGettingLink || isResendingEmail || deleteMutation.isPending}
      />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="text-purple-500" />
          Resguardos Tecnológicos
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="w-full md:w-96">
            <TextInput
              id="search"
              type="text"
              icon={Search}
              placeholder="Buscar por nombre, empleado, serie, modelo..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
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
                      <Share2 />
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
