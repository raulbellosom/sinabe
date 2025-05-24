import { Badge } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import ImageViewer from '../../../components/ImageViewer/ImageViewer';
import FileIcon from '../../../components/FileIcon/FileIcon';
import InventoryProperty from '../../../components/InventoryComponents/InventoryView/InventoryProperty';
import formatFileData from '../../../utils/fileDataFormatter';
import { MdClose, MdInfo, MdInventory, MdOutlineTextsms } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import {
  BiCategory,
  BiSolidCalendarCheck,
  BiSolidCalendarEdit,
  BiSolidCalendarPlus,
} from 'react-icons/bi';
import { parseToLocalDate } from '../../../utils/formatValues';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { TbNumber123 } from 'react-icons/tb';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import classNames from 'classnames';
import { IoCopyOutline } from 'react-icons/io5';
import { RiInputField } from 'react-icons/ri';

const InventoryPreview = ({ inventory, onClose }) => {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);

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

  const handleShareImage = (img) => {
    const imgURL =
      img instanceof File ? URL.createObjectURL(img) : `${API_URL}/${img.url}`;
    navigator.clipboard.writeText(imgURL);
  };

  if (!inventory) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-sm 2xl:text-base text-gray-500">
          No hay información disponible
        </p>
      </div>
    );
  }

  return (
    <div className="shadow-md border border-neutral-200 bg-white rounded-lg p-3 pr-1 w-full max-h-[80dvh] overflow-y-auto flex flex-col gap-3">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold text-neutral-800">
          Vista previa del inventario
        </h1>
        <div
          className="flex items-center gap-2 hover:cursor-pointer hover:bg-neutral-100 p-2 rounded-md"
          onClick={onClose}
        >
          <span className="text-sm 2xl:text-base text-neutral-500">
            <MdClose size={20} className="inline" />
          </span>
        </div>
      </div>

      {inventory?.conditions && inventory?.conditions?.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-start">
          {inventory?.conditions?.map((condition, index) => (
            <Badge
              size={'xs'}
              key={index}
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
      )}

      <div className="h-fit flex flex-col gap-4">
        <div className="h-full flex flex-col">
          <div className="grid grid-cols-12 gap-4 w-full h-full">
            {!inventoryData ? (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="col-span-12">
                    <InventoryProperty.Skeleton />
                  </div>
                ))}
              </>
            ) : inventoryData && Object.keys(inventoryData).length > 0 ? (
              Object.keys(inventoryData).map((key) => {
                const { name, icon, label } = inventoryData[key];
                return (
                  <div
                    key={key}
                    className="col-span-12 xl:col-span-6 last:col-span-12 text-xs"
                    style={{ fontSize: '0.3rem', width: '100%' }}
                  >
                    <InventoryProperty
                      label={label}
                      value={name}
                      icon={icon}
                      onSearch={null}
                      color={
                        inventory.status === 'PROPUESTA'
                          ? 'yellow'
                          : inventory.status === 'BAJA'
                            ? 'red'
                            : 'green'
                      }
                    />
                  </div>
                );
              })
            ) : null}
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
              Campos Personalizados
            </span>
          </p>
          <div className="grid grid-cols-12 gap-2 w-full h-full">
            {customFields.map((field, index) => (
              <div key={index} className="col-span-12 md:col-span-6">
                <InventoryProperty
                  label={field.label}
                  value={field.value}
                  icon={RiInputField}
                  onSearch={null}
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
        <div className="grid grid-cols-12 gap-4 lg:gap-8">
          <div className="flex flex-col gap-4 col-span-12">
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
                Archivos
              </span>
            </p>
            <div className="flex flex-col gap-2">
              {files && files?.length > 0 ? (
                files.map((file, index) => <FileIcon key={index} file={file} />)
              ) : (
                <p className="text-sm 2xl:text-base text-gray-500">
                  No hay archivos adjuntos
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-12">
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
                Imágenes
              </span>
            </p>
            <div
              className={classNames(
                'h-fit max-h-fit flex flex-wrap gap-4 overflow-y-auto',
              )}
            >
              {images.length > 0 ? (
                <ImageViewer
                  containerClassNames={'max-w-16 max-h-16'}
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
  );
};

export default InventoryPreview;
