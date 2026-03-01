// components/purchaseOrders/PurchaseOrderDetailModal.jsx
import { useState } from 'react';
import { Badge } from '../ui/flowbite';
import {
  ClipboardList,
  FileText,
  Pencil,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { useGetAllInventoriesByPurchaseOrder } from '../../hooks/usePurchaseOrders';
import PurchaseOrderInvoicesManager from './invoices/PurchaseOrderInvoicesManager';
import AllInventoriesViewer from './inventory/AllInventoriesViewer';
import ReusableModal from '../Modals/ReusableModal';

const PurchaseOrderDetailModal = ({
  isOpen,
  onClose,
  purchaseOrder,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Obtener el total de inventarios (directos + de facturas)
  const { data: inventoryData } = useGetAllInventoriesByPurchaseOrder(
    purchaseOrder?.id,
  );

  if (!purchaseOrder) return null;

  const invoiceCount = purchaseOrder.invoices?.length || 0;
  const inventoryCount = inventoryData?.summary?.totalInventories || 0;

  // Check if description is long (more than 150 characters)
  const isLongDescription =
    purchaseOrder.description && purchaseOrder.description.length > 150;

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <ClipboardList />
          <div>
            <div className="text-lg font-semibold">{purchaseOrder.code}</div>
            {purchaseOrder.supplier && (
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {purchaseOrder.supplier}
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Descripción colapsable */}
        {purchaseOrder.description && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Descripción
              </p>
              {isLongDescription && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 text-xs font-medium"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp size={10} />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown size={10} />
                      Mostrar más
                    </>
                  )}
                </button>
              )}
            </div>
            <p
              className={`text-sm text-gray-700 dark:text-gray-200 ${
                isLongDescription && !isDescriptionExpanded
                  ? 'line-clamp-3'
                  : ''
              }`}
            >
              {purchaseOrder.description}
            </p>
          </div>
        )}

        {/* Tabs de navegación - Modernas y responsivas */}
        <div className="border-b border-gray-200 dark:border-gray-600">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`
                flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <FileText />
              <span>Facturas</span>
              <Badge color={activeTab === 'invoices' ? 'blue' : 'gray'}>
                {invoiceCount}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab('inventories')}
              className={`
                flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'inventories'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <Package />
              <span>Inventarios</span>
              <Badge color={activeTab === 'inventories' ? 'blue' : 'gray'}>
                {inventoryCount}
              </Badge>
            </button>
          </nav>
        </div>

        {/* Contenido de las tabs */}
        <div className="min-h-[400px]">
          {activeTab === 'invoices' && (
            <PurchaseOrderInvoicesManager purchaseOrder={purchaseOrder} />
          )}

          {activeTab === 'inventories' && (
            <AllInventoriesViewer purchaseOrder={purchaseOrder} />
          )}
        </div>
      </div>
    </ReusableModal>
  );
};

export default PurchaseOrderDetailModal;
