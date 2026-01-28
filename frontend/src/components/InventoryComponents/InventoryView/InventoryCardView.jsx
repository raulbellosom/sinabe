import React, { useState } from 'react';
import { Badge } from 'flowbite-react';
import classNames from 'classnames';
import {
  FaSearch,
  FaClipboardList,
  FaFile,
  FaImage,
  FaHistory,
  FaInfoCircle,
} from 'react-icons/fa';
import { MdInfo } from 'react-icons/md';
import ImageViewer from '../../ImageViewer/ImageViewer2';
import Notifies from '../../Notifies/Notifies';
import { FormattedUrlImage } from '../../../utils/FormattedUrlImage';
import AuditLogHistory from '../../common/AuditLogHistory';
const FileIcon = React.lazy(() => import('../../FileIcon/FileIcon'));

// Componente para un campo individual en modo card
const CardField = ({
  label,
  value,
  icon: Icon,
  onSearch,
  color = 'purple',
}) => {
  const handleDoubleClick = () => {
    if (value) {
      Notifies('info', `${label} copiado al portapapeles`);
      navigator.clipboard.writeText(value);
    }
  };

  const iconColorClass =
    {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
    }[color] || 'text-purple-500';

  return (
    <div
      className="group flex flex-col gap-1 relative"
      onDoubleClick={handleDoubleClick}
    >
      <span className="text-sm text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon className={iconColorClass} size={14} />}
        {label}
      </span>
      <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
        {value || '—'}
        {onSearch && value && (
          <button
            onClick={onSearch}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
            title="Buscar inventarios similares"
          >
            <FaSearch className="text-gray-400 hover:text-gray-600" size={12} />
          </button>
        )}
      </span>
    </div>
  );
};

// Componente Card para agrupar campos
const InfoCard = ({
  title,
  icon: Icon,
  children,
  className,
  color = 'purple',
}) => {
  const iconColorClass =
    {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
    }[color] || 'text-purple-500';

  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-gray-100 shadow-sm p-5',
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        {Icon && <Icon className={iconColorClass} size={18} />}
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
};

const InventoryCardView = ({
  inventory,
  inventoryData,
  customFields,
  relations,
  files,
  images,
  navigate,
}) => {
  const [activeTab, setActiveTab] = useState('info');

  const statusColor =
    inventory?.status === 'PROPUESTA'
      ? 'warning'
      : inventory?.status === 'BAJA'
        ? 'failure'
        : 'success';

  const themeColor =
    inventory?.status === 'PROPUESTA'
      ? 'yellow'
      : inventory?.status === 'BAJA'
        ? 'red'
        : 'green';

  // Separar campos pillables y regulares
  const pillableFields = inventoryData.filter((f) => f.route !== null);
  const regularFields = inventoryData.filter(
    (f) => f.route === null && f.key !== 'status',
  );

  // Agrupar campos para las cards
  const identificationFields = regularFields.filter((f) =>
    ['serialNumber', 'activeNumber', 'internalFolio'].includes(f.key),
  );

  const specificationFields = pillableFields.filter(
    (f) =>
      ['model', 'brand', 'type', 'location'].includes(f.key) ||
      f.key?.startsWith('vertical'),
  );

  const relationFields = pillableFields.filter((f) =>
    ['purchaseOrder', 'invoice'].includes(f.key),
  );

  const dateFields = regularFields.filter((f) =>
    [
      'receptionDate',
      'creationDate',
      'lastModification',
      'creationUser',
    ].includes(f.key),
  );

  const otherFields = regularFields.filter(
    (f) =>
      ![
        'serialNumber',
        'activeNumber',
        'internalFolio',
        'receptionDate',
        'creationDate',
        'lastModification',
        'creationUser',
        'comments',
      ].includes(f.key),
  );

  const commentsField = regularFields.find((f) => f.key === 'comments');

  const tabs = [
    { id: 'info', label: 'Información', icon: FaInfoCircle },
    {
      id: 'images',
      label: 'Imágenes',
      icon: FaImage,
      count: images?.length || 0,
    },
    { id: 'files', label: 'Archivos', icon: FaFile, count: files?.length || 0 },
    { id: 'history', label: 'Historial', icon: FaHistory },
  ];

  // Primera imagen para el header
  const headerImage = images?.[0];

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header con imagen y datos principales */}
      <div className="bg-white border-b border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen o placeholder */}
          <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {headerImage ? (
              <ImageViewer
                images={[headerImage]}
                containerClassNames="w-full h-full"
                imageClassNames="w-full h-full object-cover"
              />
            ) : (
              <FaClipboardList className="text-gray-300" size={48} />
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {inventory?.model?.brand?.name} {inventory?.model?.name}
              </h1>
              {inventory?.receptionDate && (
                <span className="text-gray-500 text-lg">
                  ({new Date(inventory.receptionDate).getFullYear()})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {inventory?.internalFolio && (
                <Badge color="gray" className="font-mono">
                  # {inventory.internalFolio}
                </Badge>
              )}
              <Badge color={statusColor}>
                ●{' '}
                {inventory?.status === 'PROPUESTA'
                  ? 'Propuesta de Baja'
                  : inventory?.status}
              </Badge>
              {inventory?.model?.type?.name && (
                <span className="text-gray-500">
                  {inventory.model.type.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {inventory?.serialNumber && (
                <span>
                  <span className="text-gray-400">◇</span> No. Serie:{' '}
                  <strong>{inventory.serialNumber}</strong>
                </span>
              )}
              {inventory?.activeNumber && (
                <span>
                  <span className="text-gray-400">⊞</span> No. Activo:{' '}
                  <strong>{inventory.activeNumber}</strong>
                </span>
              )}
            </div>

            {/* Condiciones como badges */}
            {inventory?.conditions?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {inventory.conditions.map((condition, idx) => (
                  <Badge key={idx} color={statusColor} size="sm">
                    {condition.condition.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto overflow-y-hidden scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Identificación */}
              {identificationFields.length > 0 && (
                <InfoCard
                  title="Identificación"
                  icon={FaInfoCircle}
                  color={themeColor}
                >
                  {identificationFields.map((field) => (
                    <CardField
                      key={field.key}
                      label={field.label}
                      value={field.name}
                      icon={field.icon}
                      onSearch={
                        field.route
                          ? () => navigate(field.route)
                          : () =>
                              navigate(`/inventories?searchTerm=${field.name}`)
                      }
                      color={themeColor}
                    />
                  ))}
                </InfoCard>
              )}

              {/* Especificaciones */}
              {specificationFields.length > 0 && (
                <InfoCard
                  title="Especificaciones"
                  icon={MdInfo}
                  color={themeColor}
                >
                  {specificationFields.map((field) => (
                    <CardField
                      key={field.key}
                      label={field.label}
                      value={field.name}
                      icon={field.icon}
                      onSearch={() => navigate(field.route)}
                      color={themeColor}
                    />
                  ))}
                </InfoCard>
              )}

              {/* Información de Compra */}
              {relationFields.length > 0 && (
                <InfoCard
                  title="Información de Compra"
                  icon={FaClipboardList}
                  color={themeColor}
                >
                  {relationFields.map((field) => (
                    <CardField
                      key={field.key}
                      label={field.label}
                      value={field.name}
                      icon={field.icon}
                      onSearch={() => navigate(field.route)}
                      color={themeColor}
                    />
                  ))}
                  {/* Proyecto si existe en relaciones */}
                  {relations
                    .filter((r) => r.label === 'Proyecto')
                    .map((rel, idx) => (
                      <CardField
                        key={`project-${idx}`}
                        label={rel.label}
                        value={rel.value}
                        icon={rel.icon}
                        onSearch={() => navigate(rel.route)}
                        color={themeColor}
                      />
                    ))}
                </InfoCard>
              )}

              {/* Fechas y Estado */}
              {dateFields.length > 0 && (
                <InfoCard
                  title="Fechas y Estado"
                  icon={FaHistory}
                  color={themeColor}
                >
                  {dateFields.map((field) => (
                    <CardField
                      key={field.key}
                      label={field.label}
                      value={field.name}
                      icon={field.icon}
                      color={themeColor}
                    />
                  ))}
                </InfoCard>
              )}

              {/* Campos personalizados */}
              {customFields.length > 0 && (
                <InfoCard
                  title="Campos Personalizados"
                  icon={FaInfoCircle}
                  className="lg:col-span-2"
                  color={themeColor}
                >
                  {customFields.map((field, idx) => (
                    <CardField
                      key={idx}
                      label={field.label}
                      value={field.value}
                      onSearch={() =>
                        navigate(`/inventories?searchTerm=${field.value}`)
                      }
                      color={themeColor}
                    />
                  ))}
                </InfoCard>
              )}

              {/* Comentarios */}
              {commentsField?.name && (
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <commentsField.icon
                      className={classNames('', {
                        'text-green-500': themeColor === 'green',
                        'text-yellow-500': themeColor === 'yellow',
                        'text-red-500': themeColor === 'red',
                      })}
                      size={18}
                    />
                    <h3 className="font-semibold text-gray-700">
                      {commentsField.label}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-base whitespace-pre-wrap">
                    {commentsField.name}
                  </p>
                </div>
              )}

              {/* Deadlines */}
              {relations.filter((r) => r.label === 'Deadline').length > 0 && (
                <InfoCard
                  title="Deadlines Asignados"
                  icon={FaHistory}
                  className="lg:col-span-2"
                  color={themeColor}
                >
                  {relations
                    .filter((r) => r.label === 'Deadline')
                    .map((rel, idx) => (
                      <CardField
                        key={`deadline-${idx}`}
                        label={rel.label}
                        value={rel.value}
                        icon={rel.icon}
                        onSearch={() => navigate(rel.route)}
                        color={themeColor}
                      />
                    ))}
                </InfoCard>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-4">
                Archivos Adjuntos
              </h3>
              {files && files.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <React.Suspense
                      key={idx}
                      fallback={
                        <div className="h-10 bg-gray-100 animate-pulse rounded" />
                      }
                    >
                      <FileIcon file={file} />
                    </React.Suspense>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay archivos adjuntos
                </p>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Imágenes</h3>
              {images && images.length > 0 ? (
                <ImageViewer
                  images={images}
                  containerClassNames="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  El inventario no tiene imágenes
                </p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Historial</h3>
              <AuditLogHistory
                entityType="INVENTORY"
                entityId={inventory?.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCardView;
