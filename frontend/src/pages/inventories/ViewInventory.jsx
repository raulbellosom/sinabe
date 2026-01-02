import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, getInventory } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import InventoryProperty from '../../components/InventoryComponents/InventoryView/InventoryProperty';
import InventoryCardView from '../../components/InventoryComponents/InventoryView/InventoryCardView';
import ModalRemove from '../../components/Modals/ModalRemove';
import ImageViewer from '../../components/ImageViewer/ImageViewer2';
import {
  FaClipboardList,
  FaUser,
  FaFileInvoiceDollar,
  FaProjectDiagram,
  FaMapMarkerAlt,
  FaList,
  FaTh,
} from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { MdInfo, MdOutlineTextsms, MdInventory } from 'react-icons/md';
import { TbNumber123 } from 'react-icons/tb';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import {
  BiCategory,
  BiSolidCalendarCheck,
  BiSolidCalendarEdit,
  BiSolidCalendarPlus,
} from 'react-icons/bi';
import { Badge, Label, Select, Tooltip } from 'flowbite-react';
import classNames from 'classnames';
import { useInventoryContext } from '../../context/InventoryContext';
import { IoCopyOutline } from 'react-icons/io5';
import formatFileData from '../../utils/fileDataFormatter';
import { parseToLocalDate } from '../../utils/formatValues';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import withPermission from '../../utils/withPermissions';
import { RiInputField } from 'react-icons/ri';
import QRCodeGenerator from '../../components/QRGenerator/QRGenerator';
import { BsQrCodeScan } from 'react-icons/bs';
import ModalViewer from '../../components/Modals/ModalViewer';
import NotFound from '../notFound/NotFound';
import { ThreeCircles } from 'react-loader-spinner';
import { FaDiagramProject } from 'react-icons/fa6';
import { useUserPreference } from '../../context/UserPreferenceContext';
const FileIcon = React.lazy(() => import('../../components/FileIcon/FileIcon'));

const ViewInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteInventory } = useInventoryContext();
  const { getPreference, updatePreference } = useUserPreference();

  // Obtener la preferencia de vista (por defecto 'list')
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const savedViewMode = getPreference('inventoryDetailViewMode', 'list');
    setViewMode(savedViewMode);
  }, [getPreference]);

  const handleViewModeChange = async (mode) => {
    setViewMode(mode);
    try {
      await updatePreference('inventoryDetailViewMode', mode);
    } catch (error) {
      console.error('Error saving view preference:', error);
    }
  };

  const [inventoryData, setInventoryData] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalViewerOpen, setIsModalViewerOpen] = useState(false);
  const [qrType, setQrType] = useState('link');
  const [qrSize, setQrSize] = useState('md');
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const {
    data: inventory,
    refetch,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: ({ signal }) => getInventory({ id, signal }),
  });

  useEffect(() => {
    // --- Campos con filtro especial (pillables) - van primero ---
    const pillableFields = [];

    // Estado (siempre presente)
    pillableFields.push({
      key: 'status',
      name:
        inventory?.status === 'PROPUESTA'
          ? 'PROPUESTA DE BAJA'
          : inventory?.status || '-',
      icon: MdInfo,
      label: 'Estado',
      route: null,
    });

    // Modelo (siempre presente)
    pillableFields.push({
      key: 'model',
      name: inventory?.model?.name || '-',
      icon: MdInventory,
      label: 'Modelo',
      route: inventory?.model?.name
        ? `/inventories?modelName=${encodeURIComponent(inventory.model.name)}`
        : null,
    });

    // Marca (siempre presente)
    pillableFields.push({
      key: 'brand',
      name: inventory?.model?.brand?.name || '-',
      icon: PiTrademarkRegisteredBold,
      label: 'Marca',
      route: inventory?.model?.brand?.name
        ? `/inventories?brandName=${encodeURIComponent(inventory.model.brand.name)}`
        : null,
    });

    // Tipo de Inventario (siempre presente)
    pillableFields.push({
      key: 'type',
      name: inventory?.model?.type?.name || '-',
      icon: BiCategory,
      label: 'Tipo de Inventario',
      route: inventory?.model?.type?.name
        ? `/inventories?typeName=${encodeURIComponent(inventory.model.type.name)}`
        : null,
    });

    // Orden de Compra (siempre presente)
    const purchaseOrderCode =
      inventory?.purchaseOrder?.code || inventory?.invoice?.purchaseOrder?.code;
    pillableFields.push({
      key: 'purchaseOrder',
      name: purchaseOrderCode || '-',
      icon: FaClipboardList,
      label: 'Orden de Compra',
      route: purchaseOrderCode
        ? `/inventories?purchaseOrderCode=${encodeURIComponent(purchaseOrderCode)}`
        : null,
    });

    // Factura (siempre presente)
    pillableFields.push({
      key: 'invoice',
      name: inventory?.invoice?.code || '-',
      icon: FaFileInvoiceDollar,
      label: 'Factura',
      route: inventory?.invoice?.code
        ? `/inventories?invoiceCode=${encodeURIComponent(inventory.invoice.code)}`
        : null,
    });

    // Ubicación (siempre presente)
    pillableFields.push({
      key: 'location',
      name: inventory?.location?.name || '-',
      icon: FaMapMarkerAlt,
      label: 'Ubicación',
      route: inventory?.location?.name
        ? `/inventories?locationName=${encodeURIComponent(inventory.location.name)}`
        : null,
    });

    // Verticales (solo si existen, pueden ser múltiples)
    inventory?.model?.ModelVertical?.forEach(({ vertical }, idx) => {
      pillableFields.push({
        key: `vertical-${idx}`,
        name: vertical.name,
        icon: BiCategory,
        label: 'Vertical',
        route: `/inventories?verticalName=${encodeURIComponent(vertical.name)}`,
      });
    });

    // --- Campos regulares (sin filtro especial) - siempre presentes ---
    const regularFields = [];

    // Número de Serie (siempre presente)
    regularFields.push({
      key: 'serialNumber',
      name: inventory?.serialNumber || '-',
      icon: TbNumber123,
      label: 'Número de Serie',
      route: null,
    });

    // Número de Activo (siempre presente)
    regularFields.push({
      key: 'activeNumber',
      name: inventory?.activeNumber || '-',
      icon: AiOutlineFieldNumber,
      label: 'Número de Activo',
      route: null,
    });

    // Folio Interno (siempre presente)
    regularFields.push({
      key: 'internalFolio',
      name: inventory?.internalFolio || '-',
      icon: FaClipboardList,
      label: 'Folio Interno',
      route: null,
    });

    // Fecha de Recepción (siempre presente)
    regularFields.push({
      key: 'receptionDate',
      name: inventory?.receptionDate
        ? parseToLocalDate(inventory.receptionDate)
        : '-',
      icon: BiSolidCalendarCheck,
      label: 'Fecha de Recepción',
      route: null,
    });

    // Última Modificación (siempre presente)
    regularFields.push({
      key: 'lastModification',
      name: inventory?.updatedAt ? parseToLocalDate(inventory.updatedAt) : '-',
      icon: BiSolidCalendarEdit,
      label: 'Última Modificación',
      route: null,
    });

    // Fecha de Creación (siempre presente)
    regularFields.push({
      key: 'creationDate',
      name: inventory?.createdAt ? parseToLocalDate(inventory.createdAt) : '-',
      icon: BiSolidCalendarPlus,
      label: 'Fecha de Creación',
      route: null,
    });

    // Creado por (siempre presente)
    regularFields.push({
      key: 'creationUser',
      name: inventory?.createdBy
        ? `${inventory.createdBy.firstName} ${inventory.createdBy.lastName}`
        : '-',
      icon: FaUser,
      label: 'Creado por',
      route: null,
    });

    // Comentarios (siempre al final y ocupa todo el ancho)
    regularFields.push({
      key: 'comments',
      name: inventory?.comments || '-',
      icon: MdOutlineTextsms,
      label: 'Comentarios',
      route: null,
      fullWidth: true,
    });

    // Combinar pillables + regulares
    setInventoryData([...pillableFields, ...regularFields]);

    // --- Campos personalizados ---
    const formattedCustomFields =
      inventory?.customField?.map((field) => ({
        value: field.value,
        label: field.customField.name,
      })) || [];
    setCustomFields(formattedCustomFields);

    // --- Archivos e imágenes ---
    setFiles(formatFileData(inventory?.files || []));
    setImages(formatFileData(inventory?.images || []));

    // --- Relaciones adicionales (solo las que no son filtros de inventario) ---
    const rels = [];

    // Proyecto de la orden de compra
    const project =
      inventory?.purchaseOrder?.project ||
      inventory?.invoice?.purchaseOrder?.project;
    if (project) {
      rels.push({
        label: 'Proyecto',
        value: project.name,
        icon: FaProjectDiagram,
        route: `/projects/view/${project.id}`,
      });
    }

    // Deadlines
    inventory?.InventoryDeadline?.forEach((dl) => {
      rels.push({
        label: 'Deadline',
        value: dl?.deadline.name || parseToLocalDate(dl?.deadline.date),
        icon: BiSolidCalendarCheck,
        route: `/projects/view/${dl?.deadline.projectId}?tab=1`,
      });
    });

    setRelations(rels);
  }, [inventory]);

  // --- Handlers ---
  const onEdit = (e) => {
    if (e.ctrlKey) {
      window.open(`/inventories/edit/${id}`, '_blank');
    } else {
      navigate(`/inventories/edit/${id}`);
    }
  };
  const handleDeleteInventory = () => {
    deleteInventory(id);
    navigate('/inventories');
  };
  const onRemove = () => setIsOpenModal(true);
  const onCreate = () => navigate('/inventories/create');
  const handleShareImage = (img) => {
    const imgURL =
      img instanceof File ? URL.createObjectURL(img) : `${API_URL}/${img.url}`;
    navigator.clipboard.writeText(imgURL);
  };

  if (isPending) {
    return (
      <div className="h-full bg-white p-3 rounded-md">
        <div className="flex flex-col items-center justify-center h-full">
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#7e3af2"
            ariaLabel="three-circles-loading"
          />
          <p className="text-gray-500 text-lg mt-4">Cargando...</p>
        </div>
      </div>
    );
  }
  if (error) return <NotFound />;

  // Vista Cards/Tabs
  if (viewMode === 'cards') {
    return (
      <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 border border-gray-100 overflow-hidden">
        {/* Header con botones */}
        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-2 p-4 border-b border-gray-100">
          <div
            className={classNames('flex items-center min-w-0', {
              'text-green-500':
                inventory?.status !== 'PROPUESTA' &&
                inventory?.status !== 'BAJA',
              'text-yellow-500': inventory?.status === 'PROPUESTA',
              'text-red-500': inventory?.status === 'BAJA',
            })}
          >
            <FaClipboardList size={20} className="mr-2 flex-shrink-0" />
            <h1 className="text-base md:text-xl font-bold truncate">
              Detalles del Inventario
            </h1>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Toggle de vista */}
            <div className="flex items-center w-full border border-gray-200 rounded-lg overflow-hidden">
              <Tooltip content="Vista Lista">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={classNames(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-white text-gray-500 hover:bg-gray-50',
                  )}
                >
                  <FaList size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Vista Cards">
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={classNames(
                    'p-2 transition-colors',
                    viewMode === 'cards'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-white text-gray-500 hover:bg-gray-50',
                  )}
                >
                  <FaTh size={16} />
                </button>
              </Tooltip>
            </div>
            <ActionButtons
              onEdit={onEdit}
              onRemove={onRemove}
              extraActions={[
                {
                  label: 'QR',
                  icon: BsQrCodeScan,
                  action: () => setIsModalViewerOpen(true),
                  color: 'purple',
                },
              ]}
            />
          </div>
        </div>

        {/* Vista Cards */}
        <InventoryCardView
          inventory={inventory}
          inventoryData={inventoryData}
          customFields={customFields}
          relations={relations}
          files={files}
          images={images}
          navigate={navigate}
        />

        {/* Modales */}
        {isOpenModal && (
          <ModalRemove
            isOpenModal={isOpenModal}
            onCloseModal={() => setIsOpenModal(false)}
            removeFunction={handleDeleteInventory}
          />
        )}
        {isModalViewerOpen && (
          <ModalViewer
            isOpenModal={isModalViewerOpen}
            onCloseModal={() => setIsModalViewerOpen(false)}
            title="Generar QR"
            size="3xl"
            dismissible={true}
          >
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="w-full">
                <Label htmlFor="qrType">Tipo de QR</Label>
                <Select
                  className="mt-1"
                  id="qrType"
                  name="qrType"
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value)}
                >
                  <option value="url">URL</option>
                  <option value="sn">Número de Serie</option>
                  <option value="info">Información</option>
                </Select>
              </div>
              <div className="w-full">
                <Label htmlFor="qrSize">Tamaño del QR</Label>
                <Select
                  className="mt-1"
                  id="qrSize"
                  name="qrSize"
                  value={qrSize}
                  onChange={(e) => setQrSize(e.target.value)}
                >
                  <option value="xs">Extra pequeño</option>
                  <option value="sm">Pequeño</option>
                  <option value="md">Mediano</option>
                  <option value="lg">Grande</option>
                </Select>
              </div>
              {inventory && (
                <div className="p-4 pb-0 flex justify-center items-center w-full">
                  <QRCodeGenerator
                    inventoryInfo={inventory}
                    type={qrType}
                    qrSize={qrSize}
                  />
                </div>
              )}
            </div>
          </ModalViewer>
        )}
      </div>
    );
  }

  // Vista Lista (default)
  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border border-gray-100">
      {/* Encabezado y botones */}
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-2 pb-2">
        <div
          className={classNames('flex items-center min-w-0', {
            'text-green-500':
              inventory?.status !== 'PROPUESTA' && inventory?.status !== 'BAJA',
            'text-yellow-500': inventory?.status === 'PROPUESTA',
            'text-red-500': inventory?.status === 'BAJA',
          })}
        >
          <FaClipboardList size={20} className="mr-2 flex-shrink-0" />
          <h1 className="text-base md:text-xl font-bold truncate">
            Detalles del Inventario
          </h1>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle de vista */}
          <div className="flex items-center w-full border border-gray-200 rounded-lg overflow-hidden">
            <Tooltip content="Vista Lista">
              <button
                onClick={() => handleViewModeChange('list')}
                className={classNames(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50',
                )}
              >
                <FaList size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Vista Cards">
              <button
                onClick={() => handleViewModeChange('cards')}
                className={classNames(
                  'p-2 transition-colors',
                  viewMode === 'cards'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50',
                )}
              >
                <FaTh size={16} />
              </button>
            </Tooltip>
          </div>
          <ActionButtons
            onEdit={onEdit}
            onRemove={onRemove}
            extraActions={[
              {
                label: 'QR',
                icon: BsQrCodeScan,
                action: () => setIsModalViewerOpen(true),
                color: 'purple',
              },
            ]}
          />
        </div>
      </div>

      {/* Badges de condiciones */}
      <div className="flex flex-wrap gap-2 items-center justify-start pb-4">
        {inventory?.conditions?.map((condition, idx) => (
          <Badge
            size="sm"
            key={idx}
            color={
              inventory.status === 'PROPUESTA'
                ? 'yellow'
                : inventory.status === 'BAJA'
                  ? 'red'
                  : 'green'
            }
          >
            {condition.condition.name}
          </Badge>
        ))}
      </div>

      <div className="h-fit flex flex-col gap-2">
        {/* Datos generales */}
        <div className="h-full flex flex-col gap-4">
          <div className="grid grid-cols-12 gap-4 w-full h-full">
            {isFetching && !inventoryData
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="col-span-12">
                    <InventoryProperty.Skeleton />
                  </div>
                ))
              : (inventoryData || []).map(
                  ({ key, name, icon, label, route, fullWidth }) => (
                    <div
                      key={key}
                      className={classNames(
                        'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3',
                        { '!col-span-12': fullWidth },
                      )}
                    >
                      <InventoryProperty
                        onSearch={
                          route
                            ? () => navigate(route)
                            : () => navigate(`/inventories?searchTerm=${name}`)
                        }
                        label={label}
                        value={name}
                        icon={icon}
                        color={
                          inventory.status === 'PROPUESTA'
                            ? 'yellow'
                            : inventory.status === 'BAJA'
                              ? 'red'
                              : 'green'
                        }
                      />
                    </div>
                  ),
                )}
          </div>

          {/* Campos Personalizados */}
          <div className="">
            {/* <p
              style={{
                width: '100%',
                borderBottom: '1px solid #e2e8f0',
                lineHeight: '0.1em',
                margin: '10px 0 20px',
              }}
              className="col-span-12 text-base font-semibold pt-4"
            >
              <span style={{ background: '#fff', padding: '0 10px' }}>
                Campos Personalizados
              </span>
            </p> */}
            <div className="grid grid-cols-12 gap-4 w-full h-full">
              {customFields.map((field, i) => (
                <div
                  key={i}
                  className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 "
                >
                  <InventoryProperty
                    label={field.label}
                    value={field.value}
                    icon={RiInputField}
                    onSearch={() =>
                      navigate(`/inventories?searchTerm=${field.value}`)
                    }
                    color={
                      inventory.status === 'PROPUESTA'
                        ? 'yellow'
                        : inventory.status === 'BAJA'
                          ? 'red'
                          : 'green'
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Relaciones */}
          {relations.length > 0 && (
            <div className="">
              {/* <p
                style={{
                  width: '100%',
                  borderBottom: '1px solid #e2e8f0',
                  lineHeight: '0.1em',
                  margin: '10px 0px 20px 0px',
                }}
                className="col-span-12 text-base font-semibold pt-4 border-b border-gray-200"
              >
                <span style={{ background: '#fff', padding: '0 10px' }}>
                  Relaciones
                </span>
              </p> */}
              <div className="grid grid-cols-12 gap-4 w-full h-full">
                {relations.map((rel, i) => (
                  <div
                    key={i}
                    className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 "
                  >
                    <InventoryProperty
                      label={rel.label}
                      value={rel.value}
                      icon={rel.icon}
                      onSearch={() => navigate(rel.route)}
                      color={
                        inventory.status === 'PROPUESTA'
                          ? 'yellow'
                          : inventory.status === 'BAJA'
                            ? 'red'
                            : 'green'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Archivos e Imágenes */}
        <div className="grid grid-cols-12 gap-4 lg:gap-8">
          <div className="flex flex-col gap-4 col-span-12 lg:col-span-6">
            <p
              style={{
                width: '100%',
                borderBottom: '1px solid #e2e8f0',
                lineHeight: '0.1em',
                margin: '10px 0 20px',
              }}
              className="col-span-12 text-base font-semibold pt-4"
            >
              <span style={{ background: '#fff', padding: '0 10px' }}>
                Archivos
              </span>
            </p>
            <div className="flex flex-col gap-2">
              {files && files.length > 0 ? (
                files.map((file, idx) => <FileIcon key={idx} file={file} />)
              ) : (
                <p className="text-sm 2xl:text-base text-gray-500">
                  No hay archivos adjuntos
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-12 lg:col-span-6">
            <p
              style={{
                width: '100%',
                borderBottom: '1px solid #e2e8f0',
                lineHeight: '0.1em',
                margin: '10px 0 20px',
              }}
              className="col-span-12 text-base font-semibold pt-4"
            >
              <span style={{ background: '#fff', padding: '0 10px' }}>
                Imágenes
              </span>
            </p>
            <div className={classNames('h-full', images.length > 0 ? '' : '')}>
              {images.length > 0 ? (
                <ImageViewer
                  images={images}
                  containerClassNames="grid grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4"
                />
              ) : (
                <p className="text-sm 2xl:text-base text-neutral-500">
                  El inventario no tiene imágenes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isOpenModal && (
        <ModalRemove
          isOpenModal={isOpenModal}
          onCloseModal={() => setIsOpenModal(false)}
          removeFunction={handleDeleteInventory}
        />
      )}
      {isModalViewerOpen && (
        <ModalViewer
          isOpenModal={isModalViewerOpen}
          onCloseModal={() => setIsModalViewerOpen(false)}
          title="Generar QR"
          size="3xl"
          dismissible={true}
        >
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="w-full">
              <Label htmlFor="qrType">Tipo de QR</Label>
              <Select
                className="mt-1"
                id="qrType"
                name="qrType"
                value={qrType}
                onChange={(e) => setQrType(e.target.value)}
              >
                <option value="url">URL</option>
                <option value="sn">Número de Serie</option>
                <option value="info">Información</option>
              </Select>
            </div>
            <div className="w-full">
              <Label htmlFor="qrSize">Tamaño del QR</Label>
              <Select
                className="mt-1"
                id="qrSize"
                name="qrSize"
                value={qrSize}
                onChange={(e) => setQrSize(e.target.value)}
              >
                <option value="xs">Extra pequeño</option>
                <option value="sm">Pequeño</option>
                <option value="md">Mediano</option>
                <option value="lg">Grande</option>
              </Select>
            </div>
            {inventory && (
              <div className="p-4 pb-0 flex justify-center items-center w-full">
                <QRCodeGenerator
                  inventoryInfo={inventory}
                  type={qrType}
                  qrSize={qrSize}
                />
              </div>
            )}
          </div>
        </ModalViewer>
      )}
    </div>
  );
};

const ProtectedInventoriesView = withPermission(ViewInventory, [
  'view_inventories',
  'view_self_inventories',
]);

export default ProtectedInventoriesView;
