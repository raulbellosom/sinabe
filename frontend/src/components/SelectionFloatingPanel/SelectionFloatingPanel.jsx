/**
 * SelectionFloatingPanel
 * Floating action panel that appears (with animation) when inventories are
 * selected in the Inventories list.
 *
 * Desktop: icon + label for each action
 * Mobile:  icon only (minimal)
 *
 * Also absorbs the FloatingInventoryCart (assignment to OC / Invoice) so
 * everything lives in one central pill when on the Inventories page.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Loader2, Package, Printer, X } from 'lucide-react';
import { useInventorySelection } from '../../context/InventorySelectionProvider';

const Divider = () => (
  <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />
);

const SelectionFloatingPanel = ({
  count = 0,
  onExportExcel,
  onOpenQR,
  onClearSelection,
  isExporting = false,
}) => {
  // Cart context (assign to OC / Invoice)
  const { count: cartCount, toggleCart, clearSelection } = useInventorySelection();

  const visible = count > 0 || cartCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="selection-panel"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 md:px-3 py-2 rounded-2xl
            shadow-[0_8px_30px_rgba(0,0,0,0.18)] dark:shadow-2xl
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700"
          style={{ pointerEvents: 'auto' }}
        >
          {/* ── Table-selection actions (only when rows are checked) ── */}
          {count > 0 && (
            <>
              {/* Count badge */}
              <span className="flex items-center justify-center bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 shrink-0 select-none">
                {count}
              </span>

              <Divider />

              {/* Export Excel */}
              <button
                onClick={onExportExcel}
                disabled={isExporting}
                title="Exportar Excel"
                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl
                  text-emerald-700 dark:text-white
                  hover:bg-emerald-50 dark:hover:bg-emerald-600 transition-colors duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExporting
                  ? <Loader2 size={17} className="shrink-0 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  : <FileSpreadsheet size={17} className="shrink-0 text-emerald-600 dark:text-emerald-400" />}
                <span className="hidden md:inline text-xs font-semibold">
                  {isExporting ? 'Exportando...' : 'Exportar Excel'}
                </span>
              </button>

              <Divider />

              {/* QR Labels */}
              <button
                onClick={onOpenQR}
                title="Etiquetas QR"
                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl
                  text-purple-700 dark:text-white
                  hover:bg-purple-50 dark:hover:bg-purple-600 transition-colors duration-150"
              >
                <Printer size={17} className="shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="hidden md:inline text-xs font-semibold">
                  Etiquetas QR
                </span>
              </button>

              <Divider />

              {/* Clear table selection */}
              <button
                onClick={() => {
                  onClearSelection();
                  clearSelection();
                }}
                title="Cancelar selección"
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl
                  text-gray-500 dark:text-gray-400
                  hover:text-gray-800 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700
                  transition-colors duration-150"
              >
                <X size={14} className="shrink-0" />
                <span className="hidden md:inline text-xs font-medium">Cancelar</span>
              </button>
            </>
          )}

          {/* ── Separator between sections when both are active ── */}
          {count > 0 && cartCount > 0 && (
            <span className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
          )}

          {/* ── Cart action (assign to OC / Invoice) ── */}
          {cartCount > 0 && (
            <button
              onClick={toggleCart}
              title="Asignar a Factura / OC"
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl
                text-indigo-700 dark:text-white
                hover:bg-indigo-50 dark:hover:bg-indigo-600 transition-colors duration-150"
            >
              <div className="relative shrink-0">
                <Package size={17} className="text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center
                  bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4
                  border border-white dark:border-gray-900">
                  {cartCount}
                </span>
              </div>
              <span className="hidden md:inline text-xs font-semibold">
                {cartCount === 1 ? '1 Inventario' : `${cartCount} Inventarios`}
              </span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionFloatingPanel;
