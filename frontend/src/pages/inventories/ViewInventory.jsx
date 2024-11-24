import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, getInventory } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import InventoryProperty from '../../components/InventoryComponents/InventoryView/InventoryProperty';
import ModalRemove from '../../components/Modals/ModalRemove';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { FaClipboardList, FaUser } from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdOutlineTextsms,
} from 'react-icons/md';
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
const FileIcon = React.lazy(() => import('../../components/FileIcon/FileIcon'));

const ViewInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteInventory } = useInventoryContext();
  const [inventoryData, setInventoryData] = useState(null);
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
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: ({ signal }) => getInventory({ id, signal }),
  });

  useEffect(() => {
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
        icon: MdOutlineDirectionsCar,
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
        label: 'Número de activo',
      },
      receptionDate: {
        name: inventory?.receptionDate
          ? parseToLocalDate(inventory?.receptionDate)
          : '',
        icon: BiSolidCalendarCheck,
        label: 'Fecha de Recepción',
      },
      lastModification: {
        name: inventory?.updatedAt
          ? parseToLocalDate(inventory?.updatedAt)
          : '',
        icon: BiSolidCalendarEdit,
        label: 'Última Modificación',
      },
      creationDate: {
        name: inventory?.createdAt
          ? parseToLocalDate(inventory?.createdAt)
          : '',
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
    let formatedCustomFields = inventory?.customField?.map((field) => ({
      value: field.value,
      label: field.customField.name,
    }));
    setCustomFields(formatedCustomFields || []);
    setFiles(formatFileData(inventory?.files || []));
    setImages(formatFileData(inventory?.images || []));
    setInventoryData(data);
  }, [inventory]);

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

  const onRemove = () => {
    setIsOpenModal(true);
  };

  const onCreate = () => {
    navigate('/inventories/create');
  };

  const handleShareImage = (img) => {
    const imgURL =
      img instanceof File ? URL.createObjectURL(img) : `${API_URL}/${img.url}`;
    navigator.clipboard.writeText(imgURL);
  };
  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-4 pb-1">
        <div className="w-full rounded-md flex items-center justify-center lg:justify-start text-purple-500">
          <FaClipboardList size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Detalles del Inventario</h1>
        </div>
        <div className="w-full flex items-center justify-center lg:justify-end gap-2">
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
      <div className="flex flex-wrap gap-2 items-center justify-start pb-4">
        {inventory?.conditions &&
          inventory?.conditions?.length > 0 &&
          inventory?.conditions?.map((condition, index) => (
            <Badge size={'sm'} key={index} color="indigo">
              {condition.condition.name}
            </Badge>
          ))}
      </div>
      <div className="h-fit grid grid-cols-12 gap-4">
        <div className="h-full col-span-12 lg:col-span-6 flex flex-col">
          <div className="grid grid-cols-12 gap-2 w-full h-full">
            {isFetching && !inventoryData ? (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="col-span-12">
                    <InventoryProperty.Skeleton />
                  </div>
                ))}
              </>
            ) : (
              Object?.keys(inventoryData) &&
              Object?.keys(inventoryData)?.map((key) => {
                const { name, icon, label } = inventoryData[key];
                return (
                  <div key={key} className="col-span-6 last:col-span-12">
                    <InventoryProperty
                      onSearch={() => {
                        navigate(`/inventories?field=${key}&value=${name}`);
                      }}
                      label={label}
                      value={name}
                      icon={icon}
                    />
                  </div>
                );
              })
            )}
          </div>
          <p
            style={{
              width: '100%',
              textAlign: 'center',
              borderBottom: '1px solid #e2e8f0',
              lineHeight: '0.1em',
              margin: '10px 0 20px',
            }}
            className="col-span-12 text-base font-semibold pt-4"
          >
            <span style={{ background: '#fff', padding: '0 10px' }}>
              Información Adicional
            </span>
          </p>
          <div className="grid grid-cols-12 gap-2 w-full h-full">
            {customFields.map((field, index) => (
              <div key={index} className="col-span-6">
                <InventoryProperty
                  key={index}
                  label={field.label}
                  value={field.value}
                  icon={RiInputField}
                  onSearch={() => {
                    navigate(`/inventories?field=${key}&value=${name}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm 2xl:text-base font-semibold h-7">
                Archivos
              </h2>
              <div className="flex flex-col gap-2">
                {files && files?.length > 0 ? (
                  files.map((file, index) => (
                    <FileIcon key={index} file={file} />
                  ))
                ) : (
                  <p className="text-sm 2xl:text-base text-gray-500">
                    No hay archivos adjuntos
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm 2xl:text-base font-semibold h-7">
                Imágenes
              </h2>
              <div
                className={classNames(
                  'h-fit max-h-fit grid gap-2 overflow-y-auto',
                  images.length > 0
                    ? 'grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(8rem,_1fr))]'
                    : '',
                )}
              >
                {images.length > 0 ? (
                  <ImageViewer
                    images={images}
                    renderMenuOptions={[
                      {
                        label: 'Copiar URL',
                        icon: IoCopyOutline,
                        onClick: (img) => handleShareImage(img),
                      },
                    ]}
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
      </div>
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
                <option value="md">Medina</option>
                <option value="lg">grande</option>
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

const ProtectedInventoriesView = withPermission(
  ViewInventory,
  'view_inventories',
);

export default ProtectedInventoriesView;
