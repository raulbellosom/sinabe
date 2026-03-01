/**
 * QRLabelModal.jsx
 * Modal para generar e imprimir una etiqueta QR de un inventario individual.
 * Compatible con Zebra ZD421 mediante impresión directa desde el navegador.
 */
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  X,
  Printer,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import QRLabel, { LABEL_SIZES } from './QRLabel';
import { printZebraLabels } from '../../utils/zebraPrintUtils';

/**
 * @param {object}  props.inventory   - Objeto de inventario a etiquetar
 * @param {boolean} props.isOpen      - Controla la visibilidad del modal
 * @param {func}    props.onClose     - Callback para cerrar el modal
 */
function QRLabelModal({ inventory, isOpen, onClose }) {
  const [labelSize, setLabelSize] = useState('md');
  const [showText, setShowText] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(async () => {
    if (!inventory) return;
    setIsPrinting(true);
    try {
      await printZebraLabels([inventory], labelSize, showText);
    } finally {
      setIsPrinting(false);
    }
  }, [inventory, labelSize, showText]);

  const handleDownloadPng = useCallback(() => {
    if (!inventory) return;
    // Buscar el canvas renderizado en el preview
    const canvas = document.querySelector(
      `canvas[data-label-canvas="${inventory.id}"]`,
    );
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-qr-${inventory.internalFolio || inventory.id}.png`;
    a.click();
  }, [inventory]);

  if (!inventory) return null;

  const sizeEntries = Object.values(LABEL_SIZES);
  const currentSizeIdx = sizeEntries.findIndex((s) => s.key === labelSize);

  const cycleSizePrev = () => {
    const prev =
      sizeEntries[
        (currentSizeIdx - 1 + sizeEntries.length) % sizeEntries.length
      ];
    setLabelSize(prev.key);
  };
  const cycleSizeNext = () => {
    const next = sizeEntries[(currentSizeIdx + 1) % sizeEntries.length];
    setLabelSize(next.key);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <DialogPanel className="relative bg-[color:var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92dvh] overflow-hidden border border-[color:var(--border)]">
        {/* Header */}
        <DialogTitle
          as="div"
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]"
        >
          <div className="flex items-center gap-2">
            <QrCode className="text-purple-500" size={22} />
            <span className="font-bold text-lg text-[color:var(--foreground)]">
              Imprimir Etiqueta QR
            </span>
            <span className="text-sm text-[color:var(--foreground-muted)] ml-2">
              {inventory.internalFolio
                ? `Folio: ${inventory.internalFolio}`
                : inventory.serialNumber || inventory.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </DialogTitle>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* ── Opciones ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tamaño */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[color:var(--foreground-muted)]">
                Tamaño de etiqueta
              </label>
              <div className="flex items-center gap-2 bg-[color:var(--surface-muted)] rounded-xl p-1">
                <button
                  onClick={cycleSizePrev}
                  className="p-1 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {sizeEntries.map((cfg) => (
                  <button
                    key={cfg.key}
                    onClick={() => setLabelSize(cfg.key)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      labelSize === cfg.key
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
                <button
                  onClick={cycleSizeNext}
                  className="p-1 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[color:var(--foreground-muted)]">
                Contenido visible
              </label>
              <button
                onClick={() => setShowText((p) => !p)}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                  showText
                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {showText ? <Eye size={16} /> : <EyeOff size={16} />}
                {showText ? 'Con texto (folio, S/N, activo)' : 'Solo código QR'}
              </button>
            </div>
          </div>

          {/* ── Info del QR ── */}
          <div className="bg-[color:var(--surface-muted)] rounded-xl p-4">
            <p className="text-xs font-semibold text-[color:var(--foreground-muted)] mb-1 uppercase tracking-wide">
              Datos codificados en el QR
            </p>
            <p className="text-xs text-[color:var(--foreground)] font-mono break-all leading-relaxed">
              URL del inventario · Folio · Número de serie · Número de activo ·
              Modelo · Marca · Tipo · Estado
            </p>
          </div>

          {/* ── Preview de la etiqueta ── */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-[color:var(--foreground-muted)] self-start">
              Vista previa
            </p>
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 flex items-center justify-center min-h-48 shadow-inner w-full">
              <div
                style={{
                  transform:
                    labelSize === 'sm'
                      ? 'scale(1.8)'
                      : labelSize === 'md'
                        ? 'scale(1.2)'
                        : 'scale(1)',
                  transformOrigin: 'center center',
                }}
              >
                <QRLabel
                  inventory={inventory}
                  size={labelSize}
                  showText={showText}
                />
              </div>
            </div>
            <p className="text-xs text-[color:var(--foreground-muted)] text-center">
              Tamaño real: {LABEL_SIZES[labelSize]?.widthMm}mm ×{' '}
              {LABEL_SIZES[labelSize]?.heightMm}mm —{' '}
              {LABEL_SIZES[labelSize]?.label}
            </p>
          </div>

          {/* ── Instrucciones Zebra ── */}
          <div className="border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
              💡 Instrucciones para Zebra ZD421
            </p>
            <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>
                Asegúrate de que la Zebra esté seleccionada como impresora
                predeterminada.
              </li>
              <li>
                Configura el tamaño de papel en el controlador de la Zebra para
                que coincida con el tamaño de etiqueta seleccionado.
              </li>
              <li>
                En el diálogo de impresión del navegador, selecciona{' '}
                <b>Sin márgenes</b>.
              </li>
              <li>
                Desactiva encabezados y pies de página en las opciones de
                impresión.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[color:var(--border)] text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            <Download size={16} />
            Descargar PNG
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-md"
            >
              <Printer size={16} />
              {isPrinting ? 'Preparando…' : 'Imprimir en Zebra'}
            </button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default QRLabelModal;
