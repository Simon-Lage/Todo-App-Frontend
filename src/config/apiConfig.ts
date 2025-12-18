const PRODUCTION_API_URL = 'http://194.35.120.105/api';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    const result = url.endsWith('/api') ? url : `${url}/api`;
    console.log('[API Config] Using VITE_API_BASE_URL:', result);
    return result;
  }
  
  console.log('[API Config] Using Production URL:', PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();
