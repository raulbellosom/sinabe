/**
 * QRLabel.jsx
 * Componente de etiqueta QR diseñado para Zebra ZD421.
 * Renderiza un label con QR + campos de inventario (folio, SN, activo).
 */
import { QRCodeCanvas } from 'qrcode.react';
import Logo from '../../assets/logo/sinabe_icon.png';
import { APP_URL } from '../../config/env';

/** Configuración de tamaños para Zebra ZD421 */
export const LABEL_SIZES = {
  sm: {
    key: 'sm',
    label: 'Pequeño  2" × 1"',
    page: '50.8mm 25.4mm',
    widthMm: 50.8,
    heightMm: 25.4,
    qrPx: 68, // layout 'right'
    qrPxBottom: 50, // layout 'bottom' (deja espacio vertical para texto)
    fontSizePx: 7,
  },
  md: {
    key: 'md',
    label: 'Mediano  4" × 2"',
    page: '101.6mm 50.8mm',
    widthMm: 101.6,
    heightMm: 50.8,
    qrPx: 140,
    qrPxBottom: 112,
    fontSizePx: 10,
  },
  lg: {
    key: 'lg',
    label: 'Grande  4" × 3"',
    page: '101.6mm 76.2mm',
    widthMm: 101.6,
    heightMm: 76.2,
    qrPx: 190,
    qrPxBottom: 158,
    fontSizePx: 12,
  },
};

/** Convierte px a mm considerando 96 dpi del CSS */
const mmToScreenPx = (mm) => mm * 3.7795275591;

/**
 * Construye el texto que codifica el QR.
 * Primera línea = URL (navegadores la abren directamente).
 * Resto = campos clave en texto plano.
 */
export function buildQRValue(inventory) {
  const url = `${APP_URL.replace(/\/$/, '')}/inventory/public/${inventory.id}`;
  const fields = [
    inventory.internalFolio ? `Folio:${inventory.internalFolio}` : null,
    inventory.serialNumber ? `SN:${inventory.serialNumber}` : null,
    inventory.activeNumber ? `Activo:${inventory.activeNumber}` : null,
    inventory.model?.name ? `Modelo:${inventory.model.name}` : null,
    inventory.model?.brand?.name ? `Marca:${inventory.model.brand.name}` : null,
    inventory.model?.type?.name ? `Tipo:${inventory.model.type.name}` : null,
    inventory.status ? `Estado:${inventory.status}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return `${url}\n${fields}`;
}

/**
 * @param {object}  props.inventory    - Objeto de inventario completo
 * @param {string}  props.size         - 'sm' | 'md' | 'lg'
 * @param {string}  props.textPosition - 'right' | 'bottom' | 'none'
 *   'right'  → QR a la izquierda, texto a la derecha
 *   'bottom' → QR arriba, texto abajo
 *   'none'   → Sin texto, dos QRs lado a lado (si hay espacio)
 * @param {string}  [props.canvasId]   - ID explícito para el canvas interno
 */
function QRLabel({ inventory, size = 'md', textPosition = 'right', canvasId }) {
  const cfg = LABEL_SIZES[size] || LABEL_SIZES.md;
  const qrValue = buildQRValue(inventory);

  const PADDING = 4;
  const GAP = 6;

  const wPx = mmToScreenPx(cfg.widthMm);
  const hPx = mmToScreenPx(cfg.heightMm);

  // ── Tamaño efectivo del QR según posición ────────────────────────────
  const isDouble = textPosition === 'none';
  const isRow = textPosition === 'right' || isDouble;

  let activeQrPx;
  if (isDouble) {
    // dos QRs caben uno al lado del otro
    activeQrPx = Math.min(
      Math.floor((wPx - PADDING * 2 - GAP) / 2),
      hPx - PADDING * 2,
    );
  } else if (textPosition === 'bottom') {
    activeQrPx = cfg.qrPxBottom;
  } else {
    activeQrPx = cfg.qrPx;
  }

  const qrBlock = (id) => (
    <QRCodeCanvas
      id={id}
      value={qrValue}
      size={activeQrPx}
      bgColor="#ffffff"
      fgColor="#000000"
      title={inventory.model?.name || inventory.serialNumber}
      level="M"
      imageSettings={{
        src: Logo,
        height: Math.round(activeQrPx * 0.18),
        width: Math.round(activeQrPx * 0.18),
        excavate: true,
      }}
    />
  );

  const textMaxWidth = isRow
    ? `${wPx - activeQrPx - PADDING * 2 - GAP}px`
    : '100%';

  return (
    <div
      className="qr-label"
      data-inventory-id={inventory.id}
      style={{
        display: 'inline-flex',
        flexDirection: isRow ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isRow ? 'flex-start' : 'center',
        gap: `${GAP}px`,
        padding: `${PADDING}px`,
        border: '1px solid #bbb',
        borderRadius: '3px',
        background: '#ffffff',
        width: `${wPx}px`,
        height: `${hPx}px`,
        minWidth: `${wPx}px`,
        minHeight: `${hPx}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: '"Courier New", Courier, monospace',
      }}
    >
      {qrBlock(canvasId)}
      {isDouble && qrBlock(canvasId ? `${canvasId}-2` : undefined)}

      {!isDouble && (
        <div
          style={{
            fontSize: `${cfg.fontSizePx}px`,
            lineHeight: '1.6',
            color: '#000000',
            overflow: 'hidden',
            maxWidth: textMaxWidth,
            wordBreak: 'break-all',
          }}
        >
          {inventory.internalFolio && (
            <div>
              <b>Folio:</b> {inventory.internalFolio}
            </div>
          )}
          <div>
            <b>S/N:</b> {inventory.serialNumber || '—'}
          </div>
          <div>
            <b>Activo:</b> {inventory.activeNumber || '—'}
          </div>
          {size !== 'sm' && (
            <div>
              <b>Modelo:</b> {inventory.model?.name || '—'}
            </div>
          )}
          {size === 'lg' && (
            <>
              <div>
                <b>Marca:</b> {inventory.model?.brand?.name || '—'}
              </div>
              <div>
                <b>Tipo:</b> {inventory.model?.type?.name || '—'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default QRLabel;
