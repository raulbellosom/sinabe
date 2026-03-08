import React, { useState } from 'react';
import { Badge } from '../../ui/flowbite';
import classNames from 'classnames';
import {
  Search,
  File,
  Image,
  History,
  Info,
  Package,
  Hash,
  MessageSquare,
  SlidersHorizontal,
  Receipt,
  CalendarCheck,
  ClipboardList,
} from 'lucide-react';
import ImageViewer from '../../ImageViewer/ImageViewer2';
import Notifies from '../../Notifies/Notifies';
import AuditLogHistory from '../../common/AuditLogHistory';
import FileIcon from '../../FileIcon/FileIcon';

// Campo con label neutro y valor semibold
const Field = ({ label, value, icon: Icon, onSearch }) => {
  const handleDoubleClick = () => {
    if (value && value !== '-' && value !== '—') {
      navigator.clipboard.writeText(value);
      Notifies('info', `${label} copiado al portapapeles`);
    }
  };

  return (
    <div
      className="group flex flex-col gap-0.5"
      onDoubleClick={handleDoubleClick}
    >
      <span className="text-xs font-medium text-[color:var(--foreground-muted)] flex items-center gap-1">
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-[color:var(--foreground)] leading-snug">
          {value || '—'}
        </span>
        {onSearch && value && value !== '-' && (
          <button
            onClick={onSearch}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[color:var(--surface-muted)]"
            title="Filtrar inventarios"
          >
            <Search
              size={10}
              className="text-[color:var(--foreground-muted)]"
            />
          </button>
        )}
      </div>
    </div>
  );
};

// Sección contenedora con título neutro
const Section = ({
  title,
  icon: TitleIcon,
  children,
  className,
  columns = 1,
}) => (
  <div
    className={classNames(
      'bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-4 shadow-sm',
      className,
    )}
  >
    <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[color:var(--border)]">
      {TitleIcon && (
        <TitleIcon size={13} className="text-[color:var(--primary)]" />
      )}
      <h3 className="text-xs font-semibold text-[color:var(--primary)] uppercase tracking-wider">
        {title}
      </h3>
    </div>
    <div
      className={classNames('grid gap-x-6 gap-y-4', {
        'grid-cols-1': columns === 1,
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
      })}
    >
      {children}
    </div>
  </div>
);

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

  const pillableFields = inventoryData.filter((f) => f.route !== null);
  const regularFields = inventoryData.filter(
    (f) => f.route === null && f.key !== 'status',
  );

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
  const commentsField = regularFields.find((f) => f.key === 'comments');

  const tabs = [
    { id: 'info', label: 'Información', icon: Info },
    {
      id: 'images',
      label: 'Imágenes',
      icon: Image,
      count: images?.length || 0,
    },
    { id: 'files', label: 'Archivos', icon: File, count: files?.length || 0 },
    { id: 'history', label: 'Historial', icon: History },
  ];

  const headerImage = images?.[0];

  return (
    <div className="bg-[color:var(--background)] min-h-full">
      {/* ── Hero header ───────────────────────────────────────── */}
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border)] p-5 mb-5">
        <div className="flex flex-row gap-5 items-start">
          {/* Imagen cuadrada fija */}
          <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[color:var(--surface-muted)] border border-[color:var(--border)] flex items-center justify-center">
            {images && images.length > 0 ? (
              <ImageViewer
                images={images}
                showOnlyFirstImage
                containerClassNames="w-full h-full"
                imageStyles="object-cover w-full h-full"
              />
            ) : (
              <Package
                className="text-[color:var(--foreground-muted)]"
                size={40}
              />
            )}
          </div>

          {/* Datos principales */}
          <div className="flex-1 min-w-0">
            {/* Nombre + año */}
            <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-[color:var(--foreground)] leading-tight">
                {inventory?.model?.brand?.name} {inventory?.model?.name}
              </h1>
              {inventory?.receptionDate && (
                <span className="text-sm text-[color:var(--foreground-muted)] font-medium">
                  ({new Date(inventory.receptionDate).getFullYear()})
                </span>
              )}
            </div>

            {/* Folio · status · tipo */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {inventory?.internalFolio && (
                <span className="text-xs font-mono bg-[color:var(--surface-muted)] border border-[color:var(--border)] px-2 py-0.5 rounded-md text-[color:var(--foreground-muted)]">
                  # {inventory.internalFolio}
                </span>
              )}
              <Badge color={statusColor} size="xs">
                {inventory?.status === 'PROPUESTA'
                  ? 'Propuesta de Baja'
                  : inventory?.status}
              </Badge>
              {inventory?.model?.type?.name && (
                <span className="text-xs text-[color:var(--foreground-muted)]">
                  {inventory.model.type.name}
                </span>
              )}
            </div>

            {/* Serie · Activo */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[color:var(--foreground-muted)] mb-2">
              {inventory?.serialNumber && (
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  No. Serie:{' '}
                  <strong className="text-[color:var(--foreground)] ml-0.5">
                    {inventory.serialNumber}
                  </strong>
                </span>
              )}
              {inventory?.activeNumber && (
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  No. Activo:{' '}
                  <strong className="text-[color:var(--foreground)] ml-0.5">
                    {inventory.activeNumber}
                  </strong>
                </span>
              )}
            </div>

            {/* Condiciones */}
            {inventory?.conditions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {inventory.conditions.map((c, idx) => (
                  <Badge key={idx} color={statusColor} size="xs">
                    {c.condition.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="px-5">
        <div className="flex gap-0.5 border-b border-[color:var(--border)] mb-5 overflow-x-auto overflow-y-hidden scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0',
                activeTab === tab.id
                  ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                  : 'border-transparent text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]',
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] text-xs px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Información ────────────────────── */}
        {activeTab === 'info' && (
          <div className="pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Identificación */}
            {identificationFields.length > 0 && (
              <Section title="Identificación" icon={Hash} columns={2}>
                {identificationFields.map((field) => (
                  <Field
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
                  />
                ))}
              </Section>
            )}

            {/* Especificaciones */}
            {specificationFields.length > 0 && (
              <Section
                title="Especificaciones"
                icon={SlidersHorizontal}
                columns={2}
              >
                {specificationFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={field.name}
                    icon={field.icon}
                    onSearch={() => navigate(field.route)}
                  />
                ))}
              </Section>
            )}

            {/* Información de Compra */}
            {(relationFields.length > 0 ||
              relations.some((r) => r.label === 'Proyecto')) && (
              <Section title="Información de Compra" icon={Receipt} columns={2}>
                {relationFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={field.name}
                    icon={field.icon}
                    onSearch={() => navigate(field.route)}
                  />
                ))}
                {relations
                  .filter((r) => r.label === 'Proyecto')
                  .map((rel, idx) => (
                    <Field
                      key={`project-${idx}`}
                      label={rel.label}
                      value={rel.value}
                      icon={rel.icon}
                      onSearch={() => navigate(rel.route)}
                    />
                  ))}
              </Section>
            )}

            {/* Fechas y Auditoría */}
            {dateFields.length > 0 && (
              <Section
                title="Fechas y Auditoría"
                icon={CalendarCheck}
                columns={2}
              >
                {dateFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={field.name}
                    icon={field.icon}
                  />
                ))}
              </Section>
            )}

            {/* Campos personalizados */}
            {customFields.length > 0 && (
              <Section
                title="Campos Personalizados"
                icon={ClipboardList}
                columns={2}
                className="lg:col-span-2"
              >
                {customFields.map((field, idx) => (
                  <Field
                    key={idx}
                    label={field.label}
                    value={field.value}
                    onSearch={() =>
                      navigate(`/inventories?searchTerm=${field.value}`)
                    }
                  />
                ))}
              </Section>
            )}

            {/* Comentarios */}
            {commentsField?.name && commentsField.name !== '-' && (
              <div className="lg:col-span-2 bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)] shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[color:var(--border)]">
                  <MessageSquare
                    size={13}
                    className="text-[color:var(--foreground-muted)]"
                  />
                  <h3 className="text-xs font-semibold text-[color:var(--foreground-muted)] uppercase tracking-wider">
                    {commentsField.label}
                  </h3>
                </div>
                <p className="text-sm text-[color:var(--foreground)] whitespace-pre-wrap leading-relaxed">
                  {commentsField.name}
                </p>
              </div>
            )}

            {/* Deadlines */}
            {relations.filter((r) => r.label === 'Deadline').length > 0 && (
              <Section
                title="Deadlines Asignados"
                icon={CalendarCheck}
                columns={2}
                className="lg:col-span-2"
              >
                {relations
                  .filter((r) => r.label === 'Deadline')
                  .map((rel, idx) => (
                    <Field
                      key={`deadline-${idx}`}
                      label={rel.label}
                      value={rel.value}
                      icon={rel.icon}
                      onSearch={() => navigate(rel.route)}
                    />
                  ))}
              </Section>
            )}
          </div>
        )}

        {/* ── Tab: Archivos ────────────────────────── */}
        {activeTab === 'files' && (
          <div className="pb-6">
            <Section title="Archivos Adjuntos" icon={File} columns={1}>
              {files && files.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <FileIcon key={idx} file={file} />
                  ))}
                </div>
              ) : (
                <p className="text-[color:var(--foreground-muted)] text-center py-6 text-sm">
                  No hay archivos adjuntos
                </p>
              )}
            </Section>
          </div>
        )}

        {/* ── Tab: Imágenes ────────────────────────── */}
        {activeTab === 'images' && (
          <div className="pb-6">
            <Section title="Imágenes" icon={Image} columns={1}>
              {images && images.length > 0 ? (
                <ImageViewer
                  images={images}
                  containerClassNames="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
                />
              ) : (
                <p className="text-[color:var(--foreground-muted)] text-center py-6 text-sm">
                  El inventario no tiene imágenes
                </p>
              )}
            </Section>
          </div>
        )}

        {/* ── Tab: Historial ───────────────────────── */}
        {activeTab === 'history' && (
          <div className="pb-6">
            <Section title="Historial de Cambios" icon={History} columns={1}>
              <AuditLogHistory
                entityType="INVENTORY"
                entityId={inventory?.id}
              />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryCardView;
