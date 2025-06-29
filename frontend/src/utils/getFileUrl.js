// src/utils/getFileUrl.js
import { API_URL } from '../services/api';

export const getFileUrl = (file) => {
  if (!file) return null;
  if (file instanceof File) return URL.createObjectURL(file);
  if (file.startsWith?.('http')) return file;
  return `${API_URL}${file}`;
};
