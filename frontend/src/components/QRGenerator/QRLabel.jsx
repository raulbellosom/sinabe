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
    qrPx: 68,
    fontSizePx: 6,
    direction: 'row',
  },
  md: {
    key: 'md',
    label: 'Mediano  4" × 2"',
    page: '101.6mm 50.8mm',
    widthMm: 101.6,
    heightMm: 50.8,
    qrPx: 140,
    fontSizePx: 8.5,
    direction: 'row',
  },
  lg: {
    key: 'lg',
    label: 'Grande  4" × 3"',
    page: '101.6mm 76.2mm',
    widthMm: 101.6,
    heightMm: 76.2,
    qrPx: 190,
    fontSizePx: 10,
    direction: 'column',
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
  const url = `${APP_URL.replace(/\/$/, '')}/inventories/view/${inventory.id}`;
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
 * Componente visual de la etiqueta. Se usa tanto para preview como para
 * identificar los canvas que se capturan al imprimir.
 *
 * @param {object}  props.inventory  - Objeto de inventario completo
 * @param {string}  props.size       - 'sm' | 'md' | 'lg'
 * @param {boolean} props.showText   - Mostrar campos de texto junto al QR
 * @param {string}  [props.canvasId] - ID explicit para el <canvas> interno
 */
function QRLabel({ inventory, size = 'md', showText = true, canvasId }) {
  const cfg = LABEL_SIZES[size] || LABEL_SIZES.md;
  const qrValue = buildQRValue(inventory);
  const isRow = cfg.direction === 'row';

  const wPx = mmToScreenPx(cfg.widthMm);
  const hPx = mmToScreenPx(cfg.heightMm);

  return (
    <div
      className="qr-label"
      data-inventory-id={inventory.id}
      style={{
        display: 'inline-flex',
        flexDirection: isRow ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isRow ? 'flex-start' : 'center',
        gap: isRow ? '5px' : '4px',
        padding: '4px',
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
      <QRCodeCanvas
        id={canvasId}
        value={qrValue}
        size={cfg.qrPx}
        bgColor="#ffffff"
        fgColor="#000000"
        title={inventory.model?.name || inventory.serialNumber}
        level="M"
        imageSettings={{
          src: Logo,
          height: Math.round(cfg.qrPx * 0.18),
          width: Math.round(cfg.qrPx * 0.18),
          excavate: true,
        }}
      />
      {showText && (
        <div
          style={{
            fontSize: `${cfg.fontSizePx}px`,
            lineHeight: '1.55',
            color: '#000000',
            overflow: 'hidden',
            maxWidth: isRow ? `${wPx - cfg.qrPx - 16}px` : '100%',
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
