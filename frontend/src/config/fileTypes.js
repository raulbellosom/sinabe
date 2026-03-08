/**
 * Accepted MIME types for inventory uploads.
 *
 * IMAGE types are processed by sharp on the backend (resize + thumbnail).
 * Sharp supports: JPEG, PNG, WebP, AVIF, GIF, TIFF, SVG, HEIC/HEIF, BMP.
 *
 * FILE types are stored as-is (multer diskStorage).
 */

export const ACCEPTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/tiff',
  'image/svg+xml',
  'image/bmp',
  'image/heic',
  'image/heif',
];

export const ACCEPTED_FILE_MIMES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-7z-compressed',
  // Video
  'video/mp4',
  'video/x-msvideo',
  'video/quicktime',
  'video/webm',
  // Data
  'application/json',
  'application/xml',
  'text/xml',
  'text/csv',
  'text/plain',
];

/** All accepted MIME types (union) */
export const ALL_ACCEPTED_MIMES = [
  ...ACCEPTED_IMAGE_MIMES,
  ...ACCEPTED_FILE_MIMES,
];

/**
 * Returns true when the file's MIME type is a processable image.
 * Matches the backend logic: file.mimetype.includes('image')
 */
export const isImageFile = (file) => file?.type?.startsWith('image/');

/**
 * Accept string for the <input accept="..."> on the files input.
 * Mirrors the backend-accepted non-image types.
 */
export const FILES_INPUT_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rar,.zip,.tar,.gz,.7z,.mp4,.avi,.mov,.webm,.json,.xml,.csv,.txt';
