import { useMemo, useState } from 'react';
import { BsBoxSeam } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { Badge } from 'flowbite-react';
import { formatConditionColor } from '../../../utils/formatValues';
import Skeleton from 'react-loading-skeleton';
import ImageViewer from '../../ImageViewer/ImageViewer2';
import ActionButtons from '../../ActionButtons/ActionButtons';
import Notifies from '../../Notifies/Notifies';

const GroupedInventoryView = ({
  inventories = [],
  groupBy = 'type',
  isLoading,
}) => {
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedInventories = useMemo(() => {
    if (!Array.isArray(inventories)) return {};
    return inventories.reduce((acc, item) => {
      let key;
      switch (groupBy) {
        case 'brand':
          key = item.model?.brand?.name || 'Sin marca';
          break;
        case 'model':
          key = item.model?.name || 'Sin modelo';
          break;
        case 'deadline':
          key = item.deadline?.title || 'Sin deadline';
          break;
        default:
          key = item.model?.type?.name || 'Sin tipo';
      }
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [inventories, groupBy]);

  const getCustomFieldValue = (inventory, fieldName) => {
    return (
      inventory.customField?.find(
        (f) => f.customField?.name?.toLowerCase() === fieldName.toLowerCase(),
      )?.value || ''
    );
  };

  if (isLoading) return <Skeleton height={300} />;

  return (
    <div className="space-y-4">
      {Object.entries(groupedInventories).map(([groupName, items]) => (
        <div
          key={groupName}
          className="bg-white dark:bg-gray-900 shadow rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <button
            onClick={() => toggleGroup(groupName)}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <BsBoxSeam className="text-xl" />
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                {groupName}{' '}
                <span className="text-sm font-normal text-gray-500">
                  ({items.length} items)
                </span>
              </h3>
            </div>
            {openGroups[groupName] ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {openGroups[groupName] && (
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 gap-4 text-sm"
                >
                  {/* Left section */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <ImageViewer
                      containerClassNames="w-12 h-12 min-w-12 min-h-12"
                      showOnlyFirstImage={true}
                      images={inv.images || []}
                      imageStyles="w-12 h-12"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {inv.internalFolio || '-'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {inv.model?.name} - {inv.model?.brand?.name}
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        {inv.model?.type?.name}
                      </span>
                    </div>
                  </div>

                  {/* Info tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      color={formatConditionColor(
                        inv.conditions?.[0]?.condition?.name,
                      )}
                    >
                      {inv.conditions?.[0]?.condition?.name || 'Sin condición'}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">
                      OC:{' '}
                      <strong>
                        {getCustomFieldValue(inv, 'Orden de Compra') || '-'}
                      </strong>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Factura:{' '}
                      <strong>
                        {getCustomFieldValue(inv, 'Factura') || '-'}
                      </strong>
                    </span>
                  </div>

                  {/* Fechas y archivos */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      Recepción:{' '}
                      {inv.receptionDate
                        ? new Date(inv.receptionDate).toLocaleDateString()
                        : '-'}
                    </span>
                    <span>
                      Creación: {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Modificación:{' '}
                      {new Date(inv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3 justify-end">
                    <ActionButtons
                      extraActions={[
                        {
                          label: '',
                          icon: FaEye,
                          href: `/inventories/view/${inv.id}`,
                        },
                        {
                          label: '',
                          icon: HiOutlineClipboardList,
                          action: () => {
                            // copy all fields to clipboard
                            const fields = {
                              'Folio Interno': inv.internalFolio || '',
                              Modelo: inv.model?.name || '',
                              Marca: inv.model?.brand?.name || '',
                              Tipo: inv.model?.type?.name || '',
                              Condición:
                                inv.conditions?.[0]?.condition?.name || '',
                              'Orden de Compra': getCustomFieldValue(
                                inv,
                                'Orden de Compra',
                              ),
                              Factura: getCustomFieldValue(inv, 'Factura'),
                              Recepción: inv.receptionDate
                                ? new Date(
                                    inv.receptionDate,
                                  ).toLocaleDateString()
                                : '',
                              Creación: new Date(
                                inv.createdAt,
                              ).toLocaleDateString(),
                              Modificación: new Date(
                                inv.updatedAt,
                              ).toLocaleDateString(),
                            };
                            const textToCopy = Object.entries(fields)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join('\n');
                            navigator.clipboard.writeText(textToCopy);
                            Notifies('info', 'Campos copiados al portapapeles');
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedInventoryView;
