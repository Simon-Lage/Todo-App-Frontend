const PRODUCTION_API_URL = 'http://194.35.120.105/api';
const LOCAL_DEFAULT_API_URL = 'https://localhost:8443/api';

const normalizeBaseUrl = (url: string): string => {
  if (!url) {
    return LOCAL_DEFAULT_API_URL;
  }

  if (typeof window !== 'undefined') {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost) {
      const localUrl = 'https://localhost:8443/api';
      console.log('[API Config] Using local dev URL:', localUrl);
      return localUrl;
    }
  }

  const trimmed = url.endsWith('/') ? url.slice(0, -1) : url;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  if (import.meta.env.DEV) {
    return LOCAL_DEFAULT_API_URL;
  }

  return PRODUCTION_API_URL;
};

export const API_BASE_URL = normalizeBaseUrl(getApiBaseUrl());
