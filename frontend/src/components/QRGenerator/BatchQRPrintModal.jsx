/**
 * BatchQRPrintModal.jsx
 * Modal para imprimir etiquetas QR de múltiples inventarios en una cuadrícula.
 * Compatible con Zebra ZD421 + exportar PDF tamaño carta.
 */
import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  X,
  Printer,
  PanelRight,
  PanelBottom,
  QrCode,
  Layers,
  Trash2,
  LayoutGrid,
  FileDown,
} from 'lucide-react';
import QRLabel, { LABEL_SIZES } from './QRLabel';
import { printZebraLabels, generateLabelsPDF } from '../../utils/zebraPrintUtils';

/**
 * @param {Array}   props.inventories - Lista de inventarios seleccionados para imprimir
 * @param {boolean} props.isOpen
 * @param {func}    props.onClose
 */
function BatchQRPrintModal({ inventories = [], isOpen, onClose }) {
  const [labelSize, setLabelSize] = useState('md');
  const [textPosition, setTextPosition] = useState('right');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [localList, setLocalList] = useState(null); // null = use props

  // Si el usuario ha modificado la lista localmente usamos esa, sino las props
  const list = localList ?? inventories;

  // Sincroniza si cambia el prop (cuando se abra con nuevos items)
  useEffect(() => {
    if (isOpen) setLocalList(null);
  }, [isOpen]);

  const removeItem = useCallback(
    (id) => {
      setLocalList((prev) =>
        (prev ?? inventories).filter((inv) => inv.id !== id),
      );
    },
    [inventories],
  );

  const handlePrint = useCallback(async () => {
    if (list.length === 0) return;
    setIsPrinting(true);
    try {
      await printZebraLabels(list, labelSize, textPosition);
    } finally {
      setIsPrinting(false);
    }
  }, [list, labelSize, textPosition]);

  const handleExportPDF = useCallback(async () => {
    if (list.length === 0) return;
    setIsExporting(true);
    try {
      await generateLabelsPDF(list, labelSize, textPosition);
    } finally {
      setIsExporting(false);
    }
  }, [list, labelSize, textPosition]);

  const sizeEntries = Object.values(LABEL_SIZES);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <DialogPanel className="relative bg-[color:var(--surface)] rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[96dvh] sm:max-h-[92dvh] overflow-hidden border border-[color:var(--border)]">
        {/* Header — compacto en móvil */}
        <DialogTitle
          as="div"
          className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 sm:px-6 sm:py-4 border-b border-[color:var(--border)]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="text-purple-500 shrink-0" size={18} />
            <span className="font-bold text-sm sm:text-lg text-[color:var(--foreground)] truncate">
              Etiquetas en Lote
            </span>
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {list.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </DialogTitle>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* ── Panel de opciones (izquierda / top en móvil) ── */}
          <aside className="flex-shrink-0 w-full lg:w-64 lg:border-r border-b lg:border-b-0 border-[color:var(--border)] px-3 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto max-h-[35dvh] lg:max-h-none">
            {/* Tamaño — compacto en móvil: inline row */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[color:var(--foreground-muted)]">
                Tamaño de etiqueta
              </label>
              <div className="flex flex-row lg:flex-col gap-1.5">
                {sizeEntries.map((cfg) => (
                  <button
                    key={cfg.key}
                    onClick={() => setLabelSize(cfg.key)}
                    className={`flex items-center justify-between py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border-2 flex-1 lg:flex-none ${
                      labelSize === cfg.key
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200'
                        : 'border-transparent bg-[color:var(--surface-muted)] text-[color:var(--foreground)] hover:border-purple-300'
                    }`}
                  >
                    <span className="truncate">{cfg.label}</span>
                    {labelSize === cfg.key && (
                      <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full ml-1 shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Posición del texto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[color:var(--foreground-muted)]">
                Texto en etiqueta
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { key: 'right', icon: PanelRight, label: 'Derecha' },
                  { key: 'bottom', icon: PanelBottom, label: 'Abajo' },
                  { key: 'none', icon: LayoutGrid, label: 'Doble QR' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setTextPosition(key)}
                    className={`flex flex-col items-center gap-0.5 py-1.5 sm:py-2 px-1.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all border-2 ${
                      textPosition === key
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-transparent bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] hover:border-purple-300'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrucciones — ocultas en móvil para ahorrar espacio */}
            <div className="hidden sm:block border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700 rounded-xl p-2.5">
              <p className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                💡 Zebra ZD421
              </p>
              <ol className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 space-y-0.5 list-decimal list-inside">
                <li>Selecciona Zebra como impresora.</li>
                <li>Configura el papel al tamaño elegido.</li>
                <li>Sin márgenes y sin encabezados/pies.</li>
              </ol>
            </div>

            {/* Acciones desktop sidebar */}
            <div className="hidden lg:flex flex-col gap-2">
              <button
                onClick={handlePrint}
                disabled={isPrinting || list.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-md"
              >
                <Printer size={15} />
                {isPrinting
                  ? 'Preparando…'
                  : `Imprimir ${list.length} etiqueta${list.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting || list.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-60 text-purple-700 text-sm font-semibold transition-colors border-2 border-purple-300 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700 dark:border-purple-600"
              >
                <FileDown size={15} />
                {isExporting ? 'Generando…' : 'Exportar PDF carta'}
              </button>
            </div>
          </aside>

          {/* ── Panel de vista previa (derecha / fondo en móvil) ── */}
          <main className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[color:var(--foreground-muted)]">
                <LayoutGrid size={14} />
                <span>Vista previa de etiquetas</span>
              </div>
              {list.length > 0 && (
                <span className="text-[10px] sm:text-xs text-[color:var(--foreground-muted)]">
                  Haz clic en 🗑 para quitar una etiqueta
                </span>
              )}
            </div>

            {list.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
                <QrCode size={40} className="text-gray-300" />
                <p className="text-[color:var(--foreground-muted)] text-sm">
                  No hay etiquetas. Selecciona inventarios desde la tabla.
                </p>
              </div>
            ) : (
              <div
                className="flex flex-wrap gap-3 sm:gap-4"
                style={{ alignContent: 'flex-start' }}
              >
                {list.map((inv) => (
                  <div
                    key={inv.id}
                    className="relative group flex flex-col items-center gap-1"
                  >
                    {/* Botón quitar */}
                    <button
                      onClick={() => removeItem(inv.id)}
                      className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 shadow"
                    >
                      <Trash2 size={11} />
                    </button>

                    <div
                      className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-white hover:border-purple-400 transition-colors"
                      style={{
                        transform:
                          labelSize === 'sm'
                            ? 'scale(1.3)'
                            : labelSize === 'md'
                              ? 'scale(0.85)'
                              : 'scale(0.7)',
                        transformOrigin: 'top left',
                        marginBottom:
                          labelSize === 'sm'
                            ? '12px'
                            : labelSize === 'md'
                              ? '-12px'
                              : '-30px',
                        marginRight:
                          labelSize === 'sm'
                            ? '10px'
                            : labelSize === 'md'
                              ? '-20px'
                              : '-50px',
                      }}
                    >
                      <QRLabel
                        inventory={inv}
                        size={labelSize}
                        textPosition={textPosition}
                      />
                    </div>
                    <span
                      className="text-[10px] text-center text-[color:var(--foreground-muted)] max-w-20 truncate"
                      style={{
                        marginTop:
                          labelSize === 'sm'
                            ? '8px'
                            : labelSize === 'md'
                              ? '-8px'
                              : '-24px',
                      }}
                    >
                      {inv.internalFolio || inv.serialNumber || inv.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Footer mobile */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-5 sm:py-3 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting || list.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-60 text-purple-700 text-xs sm:text-sm font-semibold transition-colors border-2 border-purple-300 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700 dark:border-purple-600"
            >
              <FileDown size={14} />
              {isExporting ? '…' : 'PDF'}
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting || list.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-colors shadow-md"
            >
              <Printer size={14} />
              {isPrinting
                ? '…'
                : `Imprimir ${list.length}`}
            </button>
          </div>
        </div>

        {/* Footer desktop */}
        <div className="hidden lg:flex flex-shrink-0 items-center justify-end gap-3 px-6 py-3 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default BatchQRPrintModal;
