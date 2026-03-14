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
  PanelRight,
  PanelBottom,
  LayoutGrid,
  QrCode,
  Ruler,
} from 'lucide-react';
import QRLabel, { LABEL_SIZES } from './QRLabel';
import QRContentConfigurator from './QRContentConfigurator';
import QRSettingsDropdown from './QRSettingsDropdown';
import { printZebraLabels } from '../../utils/zebraPrintUtils';
import { createDefaultQRContentOptions } from '../../utils/qrCodeUtils';

/**
 * @param {object}  props.inventory   - Objeto de inventario a etiquetar
 * @param {boolean} props.isOpen      - Controla la visibilidad del modal
 * @param {func}    props.onClose     - Callback para cerrar el modal
 */
function QRLabelModal({ inventory, isOpen, onClose }) {
  const [labelSize, setLabelSize] = useState('md');
  const [textPosition, setTextPosition] = useState('right');
  const [contentOptions, setContentOptions] = useState(
    createDefaultQRContentOptions(),
  );
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(async () => {
    if (!inventory) return;
    setIsPrinting(true);
    try {
      await printZebraLabels(
        [inventory],
        labelSize,
        textPosition,
        contentOptions,
      );
    } finally {
      setIsPrinting(false);
    }
  }, [contentOptions, inventory, labelSize, textPosition]);

  const handleDownloadPng = useCallback(() => {
    if (!inventory) return;
    const canvas = document.querySelector('#qr-label-preview canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-qr-${inventory.internalFolio || inventory.id}.png`;
    a.click();
  }, [inventory]);

  if (!inventory) return null;

  const sizeOptions = Object.values(LABEL_SIZES).map((cfg) => ({
    value: cfg.key,
    label: cfg.label,
    description: `${cfg.widthMm}mm × ${cfg.heightMm}mm`,
    icon: Ruler,
  }));
  const textPositionOptions = [
    {
      value: 'right',
      label: 'Derecha',
      icon: PanelRight,
    },
    {
      value: 'bottom',
      label: 'Abajo',
      icon: PanelBottom,
    },
    {
      value: 'none',
      label: 'Doble QR',
      icon: LayoutGrid,
    },
  ];
  const selectedSizeOption = sizeOptions.find(
    (option) => option.value === labelSize,
  );
  const selectedTextPositionOption = textPositionOptions.find(
    (option) => option.value === textPosition,
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <DialogPanel className="relative bg-[color:var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[96dvh] sm:max-h-[92dvh] overflow-hidden border border-[color:var(--border)]">
        {/* Header */}
        <DialogTitle
          as="div"
          className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 sm:px-6 sm:py-4 border-b border-[color:var(--border)]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <QrCode className="text-purple-500 shrink-0" size={18} />
            <span className="font-bold text-sm sm:text-lg text-[color:var(--foreground)] truncate">
              Etiqueta QR
            </span>
            <span className="text-xs sm:text-sm text-[color:var(--foreground-muted)] truncate">
              {inventory.internalFolio
                ? inventory.internalFolio
                : inventory.serialNumber || inventory.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </DialogTitle>

        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5 flex flex-col gap-4 sm:gap-6">
          {/* ── Opciones ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <QRSettingsDropdown
              label="Tamaño de etiqueta"
              triggerIcon={selectedSizeOption?.icon}
              triggerLabel={selectedSizeOption?.label || LABEL_SIZES.md.label}
              options={sizeOptions}
              selectedValue={labelSize}
              onSelect={setLabelSize}
            />

            <QRSettingsDropdown
              label="Texto en etiqueta"
              triggerIcon={selectedTextPositionOption?.icon}
              triggerLabel={selectedTextPositionOption?.label || 'Derecha'}
              options={textPositionOptions}
              selectedValue={textPosition}
              onSelect={setTextPosition}
            />
          </div>

          <QRContentConfigurator
            value={contentOptions}
            onChange={setContentOptions}
          />

          {/* ── Preview de la etiqueta ── */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <p className="text-xs sm:text-sm font-semibold text-[color:var(--foreground-muted)] self-start">
              Vista previa
            </p>
            <div
              id="qr-label-preview"
              className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-4 sm:p-8 flex items-center justify-center min-h-32 sm:min-h-48 shadow-inner w-full"
            >
              <div
                style={{
                  transform:
                    labelSize === 'sm'
                      ? 'scale(1.6)'
                      : labelSize === 'md'
                        ? 'scale(1.1)'
                        : 'scale(1)',
                  transformOrigin: 'center center',
                }}
              >
                <QRLabel
                  inventory={inventory}
                  size={labelSize}
                  textPosition={textPosition}
                  contentOptions={contentOptions}
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
          <div className="hidden sm:block border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
              💡 Instrucciones para Zebra ZD421
            </p>
            <ol className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 space-y-0.5 sm:space-y-1 list-decimal list-inside">
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
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-4 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[color:var(--border)] text-xs sm:text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Descargar</span> PNG
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface-muted)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md"
            >
              <Printer size={14} />
              {isPrinting ? '…' : 'Imprimir'}
            </button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default QRLabelModal;
