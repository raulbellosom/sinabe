// Utilities to keep every signature image in one canonical format:
// a transparent PNG of SIGNATURE_WIDTH x SIGNATURE_HEIGHT where the ink is
// cropped to its bounding box and scaled to fill the box ("contain").
// Because the output is always the same size and already trimmed, loading
// and re-saving a signature is idempotent (it never shrinks or distorts).

export const SIGNATURE_WIDTH = 1000;
export const SIGNATURE_HEIGHT = 400;

const PADDING_RATIO = 0.06;
const MAX_UPSCALE = 4;

const createCanvas = (w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

/** Loads an Image from a data URL, blob/object URL, File/Blob or remote URL. */
export const loadImageElement = async (source) => {
  let src = source;
  let revoke = null;

  if (source instanceof Blob) {
    src = URL.createObjectURL(source);
    revoke = src;
  } else if (
    typeof source === 'string' &&
    !source.startsWith('data:') &&
    !source.startsWith('blob:')
  ) {
    // Remote URL: fetch it as a blob so the canvas is never tainted by CORS.
    const response = await fetch(source);
    if (!response.ok) throw new Error(`No se pudo cargar la firma (${response.status})`);
    src = URL.createObjectURL(await response.blob());
    revoke = src;
  }

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Imagen de firma inválida'));
      img.src = src;
    });
  } finally {
    if (revoke) setTimeout(() => URL.revokeObjectURL(revoke), 0);
  }
};

/**
 * Returns the bounding box of the "ink" in a canvas. When `knockoutLight`
 * is true, near-white pixels are made transparent first (useful for photos or
 * scans of a signature on paper).
 */
const findInkBounds = (canvas, { knockoutLight = false } = {}) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (knockoutLight) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum > 215) {
          data[i + 3] = 0;
        } else if (lum > 160) {
          // Soften anti-aliased edges instead of leaving a grey halo
          data[i + 3] = Math.round(data[i + 3] * ((215 - lum) / 55));
        }
      }
      if (data[i + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (knockoutLight) ctx.putImageData(imageData, 0, 0);
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
};

/**
 * Crops the ink of `sourceCanvas` and draws it centered/contained into a new
 * canonical canvas. Returns null when there is no ink.
 */
const normalizeCanvas = (sourceCanvas, options) => {
  const bounds = findInkBounds(sourceCanvas, options);
  if (!bounds) return null;

  const out = createCanvas(SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
  const ctx = out.getContext('2d');
  const padX = SIGNATURE_WIDTH * PADDING_RATIO;
  const padY = SIGNATURE_HEIGHT * PADDING_RATIO;
  const availW = SIGNATURE_WIDTH - padX * 2;
  const availH = SIGNATURE_HEIGHT - padY * 2;
  const scale = Math.min(availW / bounds.w, availH / bounds.h, MAX_UPSCALE);
  const drawW = bounds.w * scale;
  const drawH = bounds.h * scale;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    sourceCanvas,
    bounds.x,
    bounds.y,
    bounds.w,
    bounds.h,
    (SIGNATURE_WIDTH - drawW) / 2,
    (SIGNATURE_HEIGHT - drawH) / 2,
    drawW,
    drawH,
  );
  return out;
};

/** Normalizes the current content of a drawing canvas. */
export const normalizeSignatureCanvas = (canvas) => normalizeCanvas(canvas);

/**
 * Normalizes any signature source (data URL, URL, File) into a canonical
 * canvas. Opaque images (JPG/scans) get their light background removed.
 */
export const normalizeSignatureSource = async (source) => {
  const img = await loadImageElement(source);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  // Limit the work canvas size for very large photos
  const limit = 2000;
  const factor = Math.min(1, limit / Math.max(w, h));
  const work = createCanvas(Math.round(w * factor), Math.round(h * factor));
  work.getContext('2d').drawImage(img, 0, 0, work.width, work.height);

  const isPng =
    (source instanceof Blob && source.type === 'image/png') ||
    (typeof source === 'string' && source.startsWith('data:image/png'));
  // Signatures drawn in the app are transparent PNGs; anything else is
  // treated as a photo/scan with a light background.
  const hasTransparency = isPng && hasAnyTransparentPixel(work);
  return normalizeCanvas(work, { knockoutLight: !hasTransparency });
};

const hasAnyTransparentPixel = (canvas) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4 * 16) {
    if (data[i] < 250) return true;
  }
  return false;
};

export const canvasToPngFile = (canvas, name = 'signature.png') =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('No se pudo generar la imagen'));
      resolve(new File([blob], name, { type: 'image/png' }));
    }, 'image/png');
  });

/** Resolves the profile signature URL of a user object from any endpoint. */
export const getUserSignatureUrl = (user) => {
  if (!user) return null;
  if (user.signature?.url) return user.signature.url;
  if (Array.isArray(user.photo)) {
    const sig = user.photo.find((p) => p.type === 'SIGNATURE' && p.enabled !== false);
    if (sig?.url) return sig.url;
  }
  return null;
};
