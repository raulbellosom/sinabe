import React, { useState } from 'react';
import { Tabs } from 'flowbite-react';
import { HiLink } from 'react-icons/hi';
import {
  BiCategory,
  BiCode,
  BiSolidCalendarCheck,
  BiSolidCalendarEdit,
  BiSolidCalendarMinus,
  BiSolidCalendarPlus,
} from 'react-icons/bi';
import Notifies from '../../components/Notifies/Notifies';
import { TbNumber123 } from 'react-icons/tb';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import {
  MdInfo,
  MdInventory,
  MdOutlineDirectionsCar,
  MdOutlineTextsms,
} from 'react-icons/md';
import { parseToLocalDate } from '../../utils/formatValues';
import InventoryProperty from '../../components/InventoryComponents/InventoryView/InventoryProperty';
import { RiInputField } from 'react-icons/ri';
import FileIcon from '../../components/FileIcon/FileIcon';
import classNames from 'classnames';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';

function stripHtml(html) {
  if (!html) return '';
  // Reemplaza <br> y <br/> con saltos de línea
  const withLineBreaks = html.replace(/<br\s*\/?>/gi, '\n');
  // Elimina el resto de etiquetas HTML
  return withLineBreaks.replace(/<\/?[^>]+(>|$)/g, '');
}

// Función de transformación: convierte el inventario antiguo al nuevo formato
const transformInventory = (oldInventory) => {
  const baseUrl = 'https://apisinabe.sytes.net';
  return {
    serialNumber: oldInventory.serialNumber,
    activeNumber: oldInventory.activo,
    status: oldInventory.status, // 1 = ALTA, 2 = PROPUESTA, 3 = BAJA
    images: oldInventory?.images?.map((img) => ({
      url: baseUrl + img,
      thumbnail: baseUrl + img,
    })),
    files: oldInventory?.files?.map((file) => ({
      url: baseUrl + file.url,
      name: file.file?.name || '',
      type: file.file?.type || '',
      metadata: {
        name: file.file?.name || '',
        path: file.file?.path || '',
        size: file.file?.size || 0,
        type: file.file?.type || '',
        lastModified: file.file?.lastModified || 0,
        lastModifiedDate: file.file?.lastModifiedDate || '',
        webkitRelativePath: file.file?.webkitRelativePath || '',
      },
    })),
    altaDate: oldInventory.altaDate,
    bajaDate: oldInventory.bajaDate,
    receptionDate: oldInventory.recepcionDate,
    createdAt: oldInventory.createdAt,
    updatedAt: oldInventory.updatedAt,
    comments: oldInventory.comments,
    inventoryModel: {
      name: oldInventory.inventoryModel.name,
      inventoryBrand: { name: oldInventory.inventoryModel.inventoryBrand.name },
      inventoryType: { name: oldInventory.inventoryModel.inventoryType.name },
    },
    customFields: oldInventory.details
      .filter(
        (detail) => detail.key.trim() !== '' && detail.value.trim() !== '',
      )
      .map((detail) => ({
        customField: detail.key,
        customFieldValue: detail.value,
      })),
  };
};

// Componente para mostrar la vista previa de manera amigable
const MigratedInventoryPreview = ({ inventory }) => {
  if (!inventory) {
    return <p>No hay datos para mostrar</p>;
  }

  // Función para mapear el status numérico a un texto
  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return 'ALTA';
      case 2:
        return 'PROPUESTA';
      case 3:
        return 'BAJA';
      default:
        return 'Desconocido';
    }
  };

  const inventoryData = {
    status: {
      label: 'Estado',
      value: getStatusLabel(inventory.status),
      icon: MdInfo,
    },
    modelName: {
      label: 'Modelo',
      value: inventory.inventoryModel.name,
      icon: MdInventory,
    },
    modelBrand: {
      label: 'Marca',
      value: inventory.inventoryModel.inventoryBrand.name,
      icon: PiTrademarkRegisteredBold,
    },
    modelType: {
      label: 'Tipo de Inventario',
      value: inventory.inventoryModel.inventoryType.name,
      icon: BiCategory,
    },
    serialNumber: {
      label: 'Número de Serie',
      value: inventory.serialNumber,
      icon: TbNumber123,
    },
    activeNumber: {
      label: 'Número de Activo',
      value: inventory.activeNumber,
      icon: AiOutlineFieldNumber,
    },
    receptionDate: {
      label: 'Fecha de Recepción',
      value: inventory.receptionDate
        ? parseToLocalDate(inventory.receptionDate)
        : 'N/A',
      icon: BiSolidCalendarCheck,
    },
    altaDate: {
      label: 'Fecha de Alta',
      value: inventory.altaDate || 'N/A',
      icon: BiSolidCalendarPlus,
    },
    bajaDate: {
      label: 'Fecha de Baja',
      value: inventory.bajaDate || 'N/A',
      icon: BiSolidCalendarMinus,
    },
    createdAt: {
      label: 'Fecha de Creación',
      value: inventory.createdAt
        ? parseToLocalDate(inventory.createdAt)
        : 'N/A',
      icon: BiSolidCalendarPlus,
    },
    updatedAt: {
      label: 'Última Modificación',
      value: inventory.updatedAt
        ? parseToLocalDate(inventory.updatedAt)
        : 'N/A',
      icon: BiSolidCalendarEdit,
    },
    comments: {
      label: 'Comentarios',
      value: stripHtml(inventory.comments),
      icon: MdOutlineTextsms,
    },
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      {/* Título */}
      <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-4 pb-1">
        <div className="w-full rounded-md flex items-center justify-start text-purple-500">
          <h1 className="text-2xl font-bold">
            Vista Previa del Inventario Migrado
          </h1>
        </div>
      </div>
      {/* Grid de la información */}
      <div className="h-fit grid grid-cols-12 gap-8">
        {/* Columna Izquierda: Información general */}
        <div className="h-full col-span-12 flex flex-col">
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
              Información general
            </span>
          </p>
          <div className="grid grid-cols-12 gap-4 w-full h-full pt-3">
            {Object.keys(inventoryData).map((key) => {
              const { label, value, icon } = inventoryData[key];
              return (
                <div
                  key={key}
                  className="col-span-6 md:col-span-4 lg:col-span-3 last:col-span-12"
                >
                  <InventoryProperty label={label} value={value} icon={icon} />
                </div>
              );
            })}
          </div>
        </div>
        {/* Columna Derecha: Campos personalizados, archivos e imágenes */}
        <div className="col-span-12">
          <div className="grid grid-cols-12 gap-4 lg:gap-8">
            <div className="col-span-12">
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
              <div className="grid grid-cols-12 gap-2 w-full h-full pt-3">
                {inventory.customFields && inventory.customFields.length > 0 ? (
                  inventory.customFields.map((field, index) => (
                    <div
                      key={index}
                      className="col-span-12 md:col-span-4 lg:col-span-3"
                    >
                      <InventoryProperty
                        label={field.customField}
                        value={field.customFieldValue}
                        icon={RiInputField}
                      />
                    </div>
                  ))
                ) : (
                  <p className="col-span-12 text-sm text-gray-500">
                    No hay campos personalizados.
                  </p>
                )}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
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
              <div className="flex flex-col gap-2 pt-3">
                {inventory?.files && inventory.files.length > 0 ? (
                  inventory.files.map((file, index) => (
                    <FileIcon
                      key={index}
                      file={{
                        name: file.metadata.name,
                        size: file.metadata.size,
                        type: file.metadata.type,
                        lastModified: file.metadata.lastModified,
                        lastModifiedDate: file.metadata.lastModifiedDate,
                        webkitRelativePath: file.metadata.webkitRelativePath,
                        url: file.url,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm 2xl:text-base text-gray-500">
                    No hay archivos adjuntos
                  </p>
                )}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
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
                  'pt-3 h-fit max-h-fit grid gap-2 overflow-y-auto',
                  inventory.images && inventory.images.length > 0
                    ? 'grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(8rem,_1fr))]'
                    : '',
                )}
              >
                {inventory.images && inventory.images.length > 0 ? (
                  <ImageViewer images={inventory.images} />
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
    </div>
  );
};

const InventoryMigration = () => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Manejo de la importación por URL (usando x-access-token)
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'x-access-token': token,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener el inventario');
      }
      const data = await response.json();
      setResult(data);
      Notifies('success', 'Inventario encontrado.');
    } catch (error) {
      console.error(error);
      Notifies('error', 'Error al importar desde el endpoint.');
    }
    setIsLoading(false);
  };

  // Manejo de la importación pegando el JSON
  const handleJsonSubmit = (e) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      Notifies('error', 'Por favor, pega el contenido JSON.');
      return;
    }
    setIsLoading(true);
    try {
      const data = JSON.parse(jsonText);
      setResult(data);
      Notifies(
        'success',
        'Inventario importado correctamente desde el contenido JSON.',
      );
    } catch (error) {
      console.error(error);
      Notifies('error', 'El contenido no es un JSON válido.');
    }
    setIsLoading(false);
  };

  // Si se obtuvo un resultado, se transforma el inventario
  const transformedInventory =
    result && result.inventory ? transformInventory(result.inventory) : null;

  // Función para enviar el inventario al backend
  const handleSendInventory = async () => {
    if (!transformedInventory) return;
    setIsSending(true);
    try {
      const response = await fetch('/api/inventory/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agrega aquí otros headers si son necesarios
        },
        body: JSON.stringify({ inventory: transformedInventory }),
      });
      if (!response.ok) {
        throw new Error('Error al enviar el inventario');
      }
      const resData = await response.json();
      Notifies('success', 'Inventario enviado correctamente.');
    } catch (error) {
      console.error(error);
      Notifies('error', 'Error al enviar el inventario.');
    }
    setIsSending(false);
  };

  return (
    <section className="bg-white shadow-md rounded-md dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6">Migrar Inventario</h2>
      <Tabs
        aria-label="Tabs de migración"
        variant="fullWidth"
        className="text-nowrap overflow-x-auto"
      >
        <Tabs.Item title="Importar por URL" icon={HiLink}>
          <div className="p-4">
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="url"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  URL del Inventario
                </label>
                <input
                  type="url"
                  id="url"
                  placeholder="https://miapp.com/api/inventario/123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
              <div>
                <label
                  htmlFor="token"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Token de Acceso
                </label>
                <input
                  type="text"
                  id="token"
                  placeholder="Ingresa el token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
              >
                {isLoading ? 'Buscando...' : 'Buscar Inventario'}
              </button>
            </form>
          </div>
        </Tabs.Item>
        <Tabs.Item title="Pegar JSON" icon={BiCode}>
          <div className="p-4">
            <form onSubmit={handleJsonSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="jsonText"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Contenido JSON
                </label>
                <textarea
                  id="jsonText"
                  placeholder='Pega aquí el contenido JSON (ej. { "inventory": { ... } })'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  required
                  rows={10}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                ></textarea>
              </div>
              <button
                type="submit"
                className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
              >
                {isLoading ? 'Procesando...' : 'Procesar JSON'}
              </button>
            </form>
          </div>
        </Tabs.Item>
      </Tabs>

      {transformedInventory && (
        <div className="mt-6">
          <MigratedInventoryPreview inventory={transformedInventory} />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSendInventory}
              disabled={isSending}
              className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
            >
              {isSending ? 'Enviando...' : 'Importar Inventario'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InventoryMigration;
