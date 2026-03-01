const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const fallbackApiBaseUrl = 'http://localhost:4000';
const envApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  fallbackApiBaseUrl;

const normalizedApiBaseUrl = stripTrailingSlash(envApiBaseUrl);
const apiOrigin = normalizedApiBaseUrl.endsWith('/api')
  ? normalizedApiBaseUrl.slice(0, -4)
  : normalizedApiBaseUrl;

export const API_BASE_URL = stripTrailingSlash(apiOrigin);
export const API_URL = `${API_BASE_URL}/api`;
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Sinabe';
export const APP_URL = import.meta.env.VITE_APP_URL || API_BASE_URL;
export const IS_DEV = import.meta.env.DEV;

export const env = {
  API_BASE_URL,
  API_URL,
  APP_NAME,
  APP_URL,
  IS_DEV,
};

export default env;
