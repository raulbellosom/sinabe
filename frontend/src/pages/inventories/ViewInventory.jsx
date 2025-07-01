import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, getInventory } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import InventoryProperty from '../../components/InventoryComponents/InventoryView/InventoryProperty';
import ModalRemove from '../../components/Modals/ModalRemove';
import ImageViewer from '../../components/ImageViewer/ImageViewer2';
import {
  FaClipboardList,
  FaUser,
  FaFileInvoiceDollar,
  FaProjectDiagram,
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
import { Badge, Label, Select } from 'flowbite-react';
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
const FileIcon = React.lazy(() => import('../../components/FileIcon/FileIcon'));

const ViewInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteInventory } = useInventoryContext();

  const [inventoryData, setInventoryData] = useState(null);
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
    // --- Datos generales ---
    const data = {
      status: {
        name:
          inventory?.status === 'PROPUESTA'
            ? 'PROPUESTA DE BAJA'
            : inventory?.status,
        icon: MdInfo,
        label: 'Estado',
      },
      'model.name': {
        name: inventory?.model?.name,
        icon: MdInventory,
        label: 'Modelo',
      },
      'model.brand.name': {
        name: inventory?.model?.brand?.name,
        icon: PiTrademarkRegisteredBold,
        label: 'Marca',
      },
      'model.type.name': {
        name: inventory?.model?.type?.name,
        icon: BiCategory,
        label: 'Tipo de Inventario',
      },
      serialNumber: {
        name: inventory?.serialNumber,
        icon: TbNumber123,
        label: 'Número de Serie',
      },
      activeNumber: {
        name: inventory?.activeNumber,
        icon: AiOutlineFieldNumber,
        label: 'Número de Activo',
      },
      internalFolio: {
        name: inventory?.internalFolio,
        icon: FaClipboardList,
        label: 'Folio Interno',
      },
      receptionDate: {
        name: inventory?.receptionDate
          ? parseToLocalDate(inventory.receptionDate)
          : '',
        icon: BiSolidCalendarCheck,
        label: 'Fecha de Recepción',
      },
      lastModification: {
        name: inventory?.updatedAt ? parseToLocalDate(inventory.updatedAt) : '',
        icon: BiSolidCalendarEdit,
        label: 'Última Modificación',
      },
      creationDate: {
        name: inventory?.createdAt ? parseToLocalDate(inventory.createdAt) : '',
        icon: BiSolidCalendarPlus,
        label: 'Fecha de Creación',
      },
      creationUser: {
        name: `${inventory?.createdBy?.firstName} ${inventory?.createdBy?.lastName}`,
        icon: FaUser,
        label: 'Creado por',
      },
      comments: {
        name: inventory?.comments,
        icon: MdOutlineTextsms,
        label: 'Comentarios',
      },
    };

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

    // --- Relaciones dinámicas ---
    const rels = [];
    if (inventory?.invoice?.purchaseOrder) {
      rels.push({
        label: 'Orden de Compra',
        value: inventory.invoice.purchaseOrder.code,
        icon: FaClipboardList,
        route: `/purchase-orders/${inventory.invoice.purchaseOrder.id}/invoices`,
      });
    }
    if (inventory?.invoice) {
      rels.push({
        label: 'Factura',
        value: inventory.invoice.code,
        icon: FaFileInvoiceDollar,
        route: `/purchase-orders/${inventory.invoice.purchaseOrder.id}/invoices/?modalId=${inventory.invoice.id}`,
      });
    }
    if (inventory?.invoice?.purchaseOrder?.project) {
      rels.push({
        label: 'Proyecto',
        value: inventory.invoice.purchaseOrder.project.name,
        icon: FaProjectDiagram,
        route: `/projects/view/${inventory.invoice.purchaseOrder.project.id}`,
      });
    }
    inventory?.model?.ModelVertical?.forEach(({ vertical }) => {
      rels.push({
        label: 'Vertical',
        value: vertical.name,
        icon: BiCategory,
        route: `/verticals?modalId=${vertical.id}`,
      });
    });
    inventory?.InventoryDeadline?.forEach((dl) => {
      rels.push({
        label: 'Deadline',
        value: dl?.deadline.name || parseToLocalDate(dl?.deadline.date),
        icon: BiSolidCalendarCheck,
        route: `/deadlines/${dl.id}`,
      });
    });
    setRelations(rels);

    setInventoryData(data);
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border border-gray-100">
      {/* Encabezado y botones */}
      <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-4 pb-2">
        <div
          className={classNames(
            'w-full rounded-md flex items-center md:justify-center lg:justify-start pb-4 md:pb-0',
            {
              'text-green-500':
                inventory?.status !== 'PROPUESTA' &&
                inventory?.status !== 'BAJA',
              'text-yellow-500': inventory?.status === 'PROPUESTA',
              'text-red-500': inventory?.status === 'BAJA',
            },
          )}
        >
          <FaClipboardList size={24} className="mr-4" />
          <h1 className="md:text-xl 2xl:text-2xl font-bold">
            Detalles del Inventario
          </h1>
        </div>
        <div className="w-full grid grid-cols-2 md:flex items-center justify-center lg:justify-end gap-2">
          <ActionButtons
            onEdit={onEdit}
            onCreate={onCreate}
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
        <div className="h-full flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-4 w-full h-full">
            {isFetching && !inventoryData
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="col-span-12">
                    <InventoryProperty.Skeleton />
                  </div>
                ))
              : Object.entries(inventoryData || {}).map(
                  ([key, { name, icon, label }]) => (
                    <div
                      key={key}
                      className="col-span-12 md:col-span-4 lg:col-span-3 last:col-span-12"
                    >
                      <InventoryProperty
                        onSearch={() =>
                          navigate(`/inventories?searchTerm=${name}`)
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
          <div className="my-4">
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
                Campos Personalizados
              </span>
            </p>
            <div className="grid grid-cols-12 gap-2 w-full h-full">
              {customFields.map((field, i) => (
                <div
                  key={i}
                  className="col-span-12 md:col-span-4 lg:col-span-3"
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
            <div className="my-4">
              <p
                style={{
                  width: '100%',
                  borderBottom: '1px solid #e2e8f0',
                  lineHeight: '0.1em',
                  margin: '10px 0 20px',
                }}
                className="col-span-12 text-base font-semibold pt-4 border-b border-gray-200"
              >
                <span style={{ background: '#fff', padding: '0 10px' }}>
                  Relaciones
                </span>
              </p>
              <div className="grid grid-cols-12 gap-4">
                {relations.map((rel, i) => (
                  <div
                    key={i}
                    className="col-span-12 md:col-span-4 lg:col-span-3"
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
