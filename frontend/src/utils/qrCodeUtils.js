import QRCode from 'qrcode';
import Logo from '../assets/logo/sinabe_icon.png';
import { APP_URL } from '../config/env';

const QR_FOREGROUND = '#000000';
const QR_BACKGROUND = '#ffffff';
const QR_ERROR_CORRECTION_LEVEL = 'M';
const QR_LOGO_SCALE = 0.18;

export const QR_FIELD_KEYS = {
  URL: 'url',
  SERIAL_NUMBER: 'serialNumber',
  INTERNAL_FOLIO: 'internalFolio',
  ACTIVE_NUMBER: 'activeNumber',
  MODEL: 'model',
  BRAND: 'brand',
  TYPE: 'type',
  STATUS: 'status',
};

export const QR_COMPACT_FIELD_KEYS = [
  QR_FIELD_KEYS.URL,
  QR_FIELD_KEYS.SERIAL_NUMBER,
  QR_FIELD_KEYS.INTERNAL_FOLIO,
];

export const QR_MINIMAL_FIELD_KEYS = [...QR_COMPACT_FIELD_KEYS];

export const QR_FULL_FIELD_KEYS = [
  QR_FIELD_KEYS.URL,
  QR_FIELD_KEYS.SERIAL_NUMBER,
  QR_FIELD_KEYS.INTERNAL_FOLIO,
  QR_FIELD_KEYS.ACTIVE_NUMBER,
  QR_FIELD_KEYS.MODEL,
  QR_FIELD_KEYS.BRAND,
  QR_FIELD_KEYS.TYPE,
  QR_FIELD_KEYS.STATUS,
];

export const QR_CONTENT_PRESETS = {
  compact: {
    key: 'compact',
    label: 'URL + SN + F',
  },
  full: {
    key: 'full',
    label: 'Toda la info',
  },
  url: {
    key: 'url',
    label: 'Solo URL',
  },
  sn: {
    key: 'sn',
    label: 'Solo SN',
  },
  custom: {
    key: 'custom',
    label: 'Personalizado',
  },
};

export const QR_MINIMAL_FIELD_OPTIONS = [
  { key: QR_FIELD_KEYS.URL, label: 'URL' },
  { key: QR_FIELD_KEYS.SERIAL_NUMBER, label: 'SN' },
  { key: QR_FIELD_KEYS.INTERNAL_FOLIO, label: 'Folio' },
];

const QR_FIELD_DEFINITIONS = {
  [QR_FIELD_KEYS.URL]: {
    label: 'URL',
    getValue: (inventory) => getInventoryPublicUrl(inventory?.id),
    render: (value) => value,
  },
  [QR_FIELD_KEYS.SERIAL_NUMBER]: {
    label: 'SN',
    getValue: (inventory) => inventory?.serialNumber,
  },
  [QR_FIELD_KEYS.INTERNAL_FOLIO]: {
    label: 'F',
    getValue: (inventory) => inventory?.internalFolio,
  },
  [QR_FIELD_KEYS.ACTIVE_NUMBER]: {
    label: 'A',
    getValue: (inventory) => inventory?.activeNumber,
  },
  [QR_FIELD_KEYS.MODEL]: {
    label: 'M',
    getValue: (inventory) => inventory?.model?.name,
  },
  [QR_FIELD_KEYS.BRAND]: {
    label: 'B',
    getValue: (inventory) => inventory?.model?.brand?.name,
  },
  [QR_FIELD_KEYS.TYPE]: {
    label: 'T',
    getValue: (inventory) => inventory?.model?.type?.name,
  },
  [QR_FIELD_KEYS.STATUS]: {
    label: 'E',
    getValue: (inventory) => inventory?.status,
  },
};

export function createDefaultQRContentOptions() {
  return {
    preset: QR_CONTENT_PRESETS.compact.key,
    customFieldKeys: [...QR_COMPACT_FIELD_KEYS],
  };
}

export function getInventoryPublicUrl(inventoryId) {
  if (!inventoryId) {
    return '';
  }

  return `${APP_URL.replace(/\/$/, '')}/inventory/public/${inventoryId}`;
}

export function normalizeQRContentOptions(options = {}) {
  const preset = Object.prototype.hasOwnProperty.call(
    QR_CONTENT_PRESETS,
    options.preset,
  )
    ? options.preset
    : QR_CONTENT_PRESETS.compact.key;
  const customFieldKeys = Array.isArray(options.customFieldKeys)
    ? uniqueFieldKeys(options.customFieldKeys)
    : [...QR_COMPACT_FIELD_KEYS];

  return {
    preset,
    customFieldKeys:
      customFieldKeys.length > 0 ? customFieldKeys : [QR_FIELD_KEYS.URL],
  };
}

export function resolveQRFieldKeys(options = {}) {
  const normalized = normalizeQRContentOptions(options);

  switch (normalized.preset) {
    case QR_CONTENT_PRESETS.full.key:
      return [...QR_FULL_FIELD_KEYS];
    case QR_CONTENT_PRESETS.url.key:
      return [QR_FIELD_KEYS.URL];
    case QR_CONTENT_PRESETS.sn.key:
      return [QR_FIELD_KEYS.SERIAL_NUMBER];
    case QR_CONTENT_PRESETS.custom.key:
      return normalized.customFieldKeys.length > 0
        ? [...normalized.customFieldKeys]
        : [QR_FIELD_KEYS.URL];
    case QR_CONTENT_PRESETS.compact.key:
    default:
      return [...QR_COMPACT_FIELD_KEYS];
  }
}

export function describeQRContent(options = {}) {
  const keys = resolveQRFieldKeys(options);
  return keys
    .map((fieldKey) => QR_FIELD_DEFINITIONS[fieldKey]?.label)
    .filter(Boolean)
    .join(' · ');
}

export function buildQRValue(inventory, options = {}) {
  const selectedFieldKeys = resolveQRFieldKeys(options);
  const urlValue = buildQRFieldValue(inventory, QR_FIELD_KEYS.URL);
  const includesUrl = selectedFieldKeys.includes(QR_FIELD_KEYS.URL) && urlValue;
  const otherTokens = selectedFieldKeys
    .filter((fieldKey) => fieldKey !== QR_FIELD_KEYS.URL)
    .map((fieldKey) => buildQRFieldValue(inventory, fieldKey))
    .filter(Boolean);

  if (includesUrl && otherTokens.length === 0) {
    return urlValue;
  }

  if (includesUrl) {
    return `${urlValue}\n${otherTokens.join(' | ')}`;
  }

  const inlineValue = otherTokens.join(' | ');
  return inlineValue || urlValue;
}

export function getQRCodeCanvasProps(sizePx, title) {
  return {
    bgColor: QR_BACKGROUND,
    fgColor: QR_FOREGROUND,
    level: QR_ERROR_CORRECTION_LEVEL,
    title,
    imageSettings: {
      src: Logo,
      height: Math.round(sizePx * QR_LOGO_SCALE),
      width: Math.round(sizePx * QR_LOGO_SCALE),
      excavate: true,
    },
  };
}

export async function generateStyledQRDataUrl(value, sizePx = 140) {
  const qrDataUrl = await QRCode.toDataURL(value, {
    width: sizePx,
    margin: 1,
    color: { dark: QR_FOREGROUND, light: QR_BACKGROUND },
    errorCorrectionLevel: QR_ERROR_CORRECTION_LEVEL,
  });

  const canvas = document.createElement('canvas');
  canvas.width = sizePx;
  canvas.height = sizePx;

  const context = canvas.getContext('2d');
  if (!context) {
    return qrDataUrl;
  }

  const [qrImage, logoImage] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage(Logo),
  ]);

  context.fillStyle = QR_BACKGROUND;
  context.fillRect(0, 0, sizePx, sizePx);
  context.drawImage(qrImage, 0, 0, sizePx, sizePx);

  const logoSize = Math.round(sizePx * QR_LOGO_SCALE);
  const logoPadding = Math.max(4, Math.round(logoSize * 0.18));
  const logoX = Math.round((sizePx - logoSize) / 2);
  const logoY = Math.round((sizePx - logoSize) / 2);

  context.fillStyle = QR_BACKGROUND;
  context.fillRect(
    logoX - logoPadding,
    logoY - logoPadding,
    logoSize + logoPadding * 2,
    logoSize + logoPadding * 2,
  );
  context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

  return canvas.toDataURL('image/png');
}

function buildQRFieldValue(inventory, fieldKey) {
  const fieldDefinition = QR_FIELD_DEFINITIONS[fieldKey];
  if (!fieldDefinition) {
    return null;
  }

  const rawValue = fieldDefinition.getValue(inventory);
  if (!rawValue) {
    return null;
  }

  if (typeof fieldDefinition.render === 'function') {
    return fieldDefinition.render(rawValue, inventory);
  }

  return `${fieldDefinition.label}:${rawValue}`;
}

function uniqueFieldKeys(fieldKeys) {
  const knownFieldKeys = new Set(Object.values(QR_FIELD_KEYS));
  return [...new Set(fieldKeys)].filter((fieldKey) =>
    knownFieldKeys.has(fieldKey),
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`No se pudo cargar la imagen ${src}`));
    image.src = src;
  });
}
