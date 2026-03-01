/**
 * zebraPrintUtils.js
 * Utilidades para generar e imprimir etiquetas QR en Zebra ZD421.
 * Estrategia: captura los canvas del DOM, convierte a dataURL y los
 * inyecta en un nuevo window con el HTML de impresión listo para Zebra.
 */
import { LABEL_SIZES, buildQRValue } from '../components/QRGenerator/QRLabel';
import QRCode from 'qrcode';

/**
 * Genera el valor del QR como dataURL PNG usando la librería `qrcode`
 * (funciona sin DOM, útil para el nuevo window de impresión).
 * @returns {Promise<string>} dataURL
 */
export async function generateQRDataUrl(
  value,
  sizePx = 140,
  fgColor = '#000000',
) {
  return await QRCode.toDataURL(value, {
    width: sizePx,
    margin: 1,
    color: { dark: fgColor, light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Construye el HTML interno de una etiqueta para el print window.
 * @param {object}  inventory
 * @param {string}  qrDataUrl  - PNG en base64
 * @param {object}  cfg        - Config del tamaño (LABEL_SIZES[size])
 * @param {boolean} showText
 * @returns {string} HTML string
 */
export function buildLabelHtml(inventory, qrDataUrl, cfg, showText) {
  const isRow = cfg.direction === 'row';
  const qrMm = cfg.qrPx * 0.264583; // px → mm  @96dpi

  const textFields = [];
  if (inventory.internalFolio)
    textFields.push(`<div><b>Folio:</b> ${inventory.internalFolio}</div>`);
  textFields.push(`<div><b>S/N:</b> ${inventory.serialNumber || '—'}</div>`);
  textFields.push(`<div><b>Activo:</b> ${inventory.activeNumber || '—'}</div>`);
  if (cfg.key !== 'sm' && inventory.model?.name)
    textFields.push(`<div><b>Modelo:</b> ${inventory.model.name}</div>`);
  if (cfg.key === 'lg' && inventory.model?.brand?.name)
    textFields.push(`<div><b>Marca:</b> ${inventory.model.brand.name}</div>`);
  if (cfg.key === 'lg' && inventory.model?.type?.name)
    textFields.push(`<div><b>Tipo:</b> ${inventory.model.type.name}</div>`);

  const textHtml = showText
    ? `<div class="label-text">${textFields.join('')}</div>`
    : '';

  return `
    <div class="label label--${cfg.key}" style="flex-direction:${isRow ? 'row' : 'column'}">
      <img class="label-qr" src="${qrDataUrl}" style="width:${qrMm}mm;height:${qrMm}mm;" alt="QR"/>
      ${textHtml}
    </div>`;
}

/**
 * CSS para el documento de impresión.
 * @param {object} cfg - Config del tamaño
 */
function buildPrintCss(cfg) {
  const isRow = cfg.direction === 'row';
  const qrMm = cfg.qrPx * 0.264583;

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: ${cfg.page};
      margin: 0;
    }

    html, body {
      width: ${cfg.widthMm}mm;
      margin: 0;
      padding: 0;
      background: #fff;
    }

    .label-grid {
      display: flex;
      flex-wrap: wrap;
    }

    .label {
      display: flex;
      align-items: center;
      justify-content: ${isRow ? 'flex-start' : 'center'};
      gap: ${isRow ? '1.5mm' : '1mm'};
      padding: 1.5mm;
      width: ${cfg.widthMm}mm;
      height: ${cfg.heightMm}mm;
      overflow: hidden;
      border: 0.2mm solid #aaa;
      page-break-inside: avoid;
      background: #fff;
    }

    .label-qr {
      flex-shrink: 0;
      width: ${qrMm}mm;
      height: ${qrMm}mm;
      object-fit: contain;
    }

    .label-text {
      font-family: "Courier New", Courier, monospace;
      font-size: ${cfg.fontSizePx * 0.264583}mm;
      line-height: 1.5;
      color: #000;
      overflow: hidden;
      flex: 1;
      word-break: break-all;
    }

    .label-text b { font-weight: bold; }
  `;
}

/**
 * Abre un nuevo window de impresión con las etiquetas listas para Zebra ZD421.
 * @param {Array}   inventories  - Lista de inventarios seleccionados
 * @param {string}  size         - 'sm' | 'md' | 'lg'
 * @param {boolean} showText     - Mostrar texto junto al QR
 */
export async function printZebraLabels(
  inventories,
  size = 'md',
  showText = true,
) {
  const cfg = LABEL_SIZES[size] || LABEL_SIZES.md;

  // Generar QR data URLs para todos los inventarios en paralelo
  const qrDataUrls = await Promise.all(
    inventories.map((inv) => generateQRDataUrl(buildQRValue(inv), cfg.qrPx)),
  );

  // Construir HTML de etiquetas
  const labelsHtml = inventories
    .map((inv, i) => buildLabelHtml(inv, qrDataUrls[i], cfg, showText))
    .join('');

  const css = buildPrintCss(cfg);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Etiquetas QR – Sinabe</title>
  <style>${css}</style>
</head>
<body>
  <div class="label-grid">
    ${labelsHtml}
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
        window.close();
      }, 300);
    };
  <\/script>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=600,noopener');
  if (!printWin) {
    alert(
      'No se pudo abrir la ventana de impresión. Permite ventanas emergentes para este sitio.',
    );
    return;
  }
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}
