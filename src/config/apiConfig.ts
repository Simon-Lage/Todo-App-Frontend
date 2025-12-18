const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  
  if (typeof window !== 'undefined') {
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor) {
      const capacitorConfig = (window as any).Capacitor?.getConfig?.();
      if (capacitorConfig?.server?.url) {
        return `${capacitorConfig.server.url}/api`;
      }
      return 'https://your-server.com/api';
    }
  }
  
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
