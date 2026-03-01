/**
 * zebraPrintUtils.js
 * Utilidades para generar e imprimir etiquetas QR en Zebra ZD421.
 * Estrategia: captura los canvas del DOM, convierte a dataURL y los
 * inyecta en un nuevo window con el HTML de impresión listo para Zebra.
 */
import { LABEL_SIZES, buildQRValue } from '../components/QRGenerator/QRLabel';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

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
 * Devuelve el tamaño en px del QR según la posición de texto elegida.
 * @param {object} cfg
 * @param {string} textPosition - 'right' | 'bottom' | 'none'
 */
function getEffectiveQrPx(cfg, textPosition) {
  if (textPosition === 'none') {
    // Dos QRs lado a lado: cada uno ocupa ~la mitad del ancho
    return Math.min(
      Math.floor((cfg.widthMm - 3) / 2 / 0.264583),
      Math.floor((cfg.heightMm - 2) / 0.264583),
    );
  }
  if (textPosition === 'bottom') return cfg.qrPxBottom;
  return cfg.qrPx; // 'right'
}

/**
 * Construye el HTML interno de una etiqueta para el print window.
 * @param {object} inventory
 * @param {string} qrDataUrl    - PNG en base64
 * @param {object} cfg          - Config del tamaño (LABEL_SIZES[size])
 * @param {string} textPosition - 'right' | 'bottom' | 'none'
 * @returns {string} HTML string
 */
export function buildLabelHtml(inventory, qrDataUrl, cfg, textPosition) {
  const isDouble = textPosition === 'none';
  const isRow = textPosition === 'right' || isDouble;
  const qrPx = getEffectiveQrPx(cfg, textPosition);
  const qrMm = (qrPx * 0.264583).toFixed(2);

  if (isDouble) {
    return `
    <div class="label label--${cfg.key}" style="flex-direction:row;justify-content:center;align-items:center;gap:2mm;">
      <img src="${qrDataUrl}" style="width:${qrMm}mm;height:${qrMm}mm;flex-shrink:0;" alt="QR"/>
      <img src="${qrDataUrl}" style="width:${qrMm}mm;height:${qrMm}mm;flex-shrink:0;" alt="QR"/>
    </div>`;
  }

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

  return `
    <div class="label label--${cfg.key}" style="flex-direction:${isRow ? 'row' : 'column'};${!isRow ? 'align-items:center;' : ''}">
      <img class="label-qr" src="${qrDataUrl}" style="width:${qrMm}mm;height:${qrMm}mm;" alt="QR"/>
      <div class="label-text">${textFields.join('')}</div>
    </div>`;
}

/**
 * CSS para el documento de impresión.
 * @param {object} cfg          - Config del tamaño
 * @param {string} textPosition - 'right' | 'bottom' | 'none'
 */
function buildPrintCss(cfg, textPosition) {
  const isDouble = textPosition === 'none';
  const isRow = textPosition === 'right' || isDouble;
  const qrPx = getEffectiveQrPx(cfg, textPosition);
  const qrMm = (qrPx * 0.264583).toFixed(2);

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
      font-size: ${(cfg.fontSizePx * 0.264583).toFixed(3)}mm;
      line-height: 1.6;
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
 * @param {Array}  inventories  - Lista de inventarios seleccionados
 * @param {string} size         - 'sm' | 'md' | 'lg'
 * @param {string} textPosition - 'right' | 'bottom' | 'none'
 */
export async function printZebraLabels(
  inventories,
  size = 'md',
  textPosition = 'right',
) {
  const cfg = LABEL_SIZES[size] || LABEL_SIZES.md;
  const qrPx = getEffectiveQrPx(cfg, textPosition);

  // Generar QR data URLs para todos los inventarios en paralelo
  const qrDataUrls = await Promise.all(
    inventories.map((inv) => generateQRDataUrl(buildQRValue(inv), qrPx)),
  );

  // Construir HTML de etiquetas
  const labelsHtml = inventories
    .map((inv, i) => buildLabelHtml(inv, qrDataUrls[i], cfg, textPosition))
    .join('');

  const css = buildPrintCss(cfg, textPosition);

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

/**
 * Genera un PDF tamaño carta con todas las etiquetas QR ordenadas en cuadrícula.
 * Descarga automáticamente el archivo.
 * @param {Array}  inventories  - Lista de inventarios seleccionados
 * @param {string} size         - 'sm' | 'md' | 'lg'
 * @param {string} textPosition - 'right' | 'bottom' | 'none'
 */
export async function generateLabelsPDF(
  inventories,
  size = 'md',
  textPosition = 'right',
) {
  const cfg = LABEL_SIZES[size] || LABEL_SIZES.md;
  const qrPx = getEffectiveQrPx(cfg, textPosition);

  // Carta = 215.9 x 279.4 mm  ─  márgenes 10mm
  const PAGE_W = 215.9;
  const PAGE_H = 279.4;
  const MARGIN = 10;
  const GAP = 3;

  const labelW = cfg.widthMm;
  const labelH = cfg.heightMm;

  // Cuántas etiquetas caben
  const cols = Math.floor((PAGE_W - MARGIN * 2 + GAP) / (labelW + GAP));
  const rows = Math.floor((PAGE_H - MARGIN * 2 + GAP) / (labelH + GAP));
  const perPage = cols * rows;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  // Generar QR dataURLs
  const qrDataUrls = await Promise.all(
    inventories.map((inv) => generateQRDataUrl(buildQRValue(inv), qrPx)),
  );

  const isDouble = textPosition === 'none';
  const isRow = textPosition === 'right' || isDouble;

  for (let i = 0; i < inventories.length; i++) {
    const pageIdx = Math.floor(i / perPage);
    const posOnPage = i % perPage;

    if (posOnPage === 0 && pageIdx > 0) {
      doc.addPage('letter', 'portrait');
    }

    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);

    const x = MARGIN + col * (labelW + GAP);
    const y = MARGIN + row * (labelH + GAP);

    const inv = inventories[i];
    const qrDataUrl = qrDataUrls[i];

    // Borde de etiqueta
    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.rect(x, y, labelW, labelH);

    const PAD = 1.5;
    const qrMm = qrPx * 0.264583;
    const effectiveQrMm = Math.min(qrMm, labelH - PAD * 2);

    if (isDouble) {
      // Dos QRs centrados
      const totalW = effectiveQrMm * 2 + 2;
      const startX = x + (labelW - totalW) / 2;
      const qrY = y + (labelH - effectiveQrMm) / 2;
      doc.addImage(qrDataUrl, 'PNG', startX, qrY, effectiveQrMm, effectiveQrMm);
      doc.addImage(
        qrDataUrl,
        'PNG',
        startX + effectiveQrMm + 2,
        qrY,
        effectiveQrMm,
        effectiveQrMm,
      );
    } else if (isRow) {
      // QR izquierda + texto derecha
      const qrX = x + PAD;
      const qrY = y + (labelH - effectiveQrMm) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, effectiveQrMm, effectiveQrMm);

      const textX = qrX + effectiveQrMm + 1.5;
      const textMaxW = labelW - (effectiveQrMm + PAD * 2 + 1.5);
      // Align text vertically with the QR: qrY + one lineH so baseline sits at the top of the QR
      const _fontSize = Math.max(cfg.fontSizePx * 0.264583 * 2.5, 5);
      const _lineH = _fontSize * 0.45;
      drawLabelText(doc, inv, cfg, textX, qrY + _lineH, textMaxW);
    } else {
      // QR arriba + texto abajo
      const qrBottomMm = Math.min(cfg.qrPxBottom * 0.264583, labelH * 0.6);
      const qrX = x + (labelW - qrBottomMm) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrX, y + PAD, qrBottomMm, qrBottomMm);

      // Use one full lineH as gap so the text baseline clears the bottom of the QR
      const _textFontSize = Math.max(cfg.fontSizePx * 0.264583 * 2.5, 5);
      const _lineH = _textFontSize * 0.45;
      const textY = y + PAD + qrBottomMm + _lineH;
      const textMaxW = labelW - PAD * 2;
      // Center the text block horizontally below the QR
      drawLabelText(doc, inv, cfg, x + labelW / 2, textY, textMaxW, 'center');
    }
  }

  doc.save(`etiquetas_qr_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Dibuja los campos de texto de una etiqueta en el PDF.
 * @param {string} [align='left'] - 'left' | 'center'
 */
function drawLabelText(doc, inv, cfg, x, y, maxW, align = 'left') {
  const fontSize = Math.max(cfg.fontSizePx * 0.264583 * 2.5, 5);
  doc.setFont('Courier', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

  const lineH = fontSize * 0.45;
  let curY = y;

  const lines = [];
  if (inv.internalFolio) lines.push(`Folio: ${inv.internalFolio}`);
  lines.push(`S/N: ${inv.serialNumber || '—'}`);
  lines.push(`Activo: ${inv.activeNumber || '—'}`);
  if (cfg.key !== 'sm' && inv.model?.name)
    lines.push(`Modelo: ${inv.model.name}`);
  if (cfg.key === 'lg' && inv.model?.brand?.name)
    lines.push(`Marca: ${inv.model.brand.name}`);
  if (cfg.key === 'lg' && inv.model?.type?.name)
    lines.push(`Tipo: ${inv.model.type.name}`);

  for (const line of lines) {
    // Truncate if too wide
    let text = line;
    while (doc.getTextWidth(text) > maxW && text.length > 3) {
      text = text.slice(0, -1);
    }
    doc.text(text, x, curY, { align });
    curY += lineH;
  }
}
