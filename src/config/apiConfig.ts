const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    const result = url.endsWith('/api') ? url : `${url}/api`;
    console.log('[API Config] Using VITE_API_BASE_URL:', result);
    return result;
  }
  
  if (typeof window !== 'undefined') {
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor) {
      const capacitorConfig = (window as any).Capacitor?.getConfig?.();
      if (capacitorConfig?.server?.url) {
        const result = `${capacitorConfig.server.url}/api`;
        console.log('[API Config] Using Capacitor server URL:', result);
        return result;
      }
      const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
      if (!isDev) {
        const result = 'https://194.35.120.105:8443/api';
        console.log('[API Config] Using Production IP (Capacitor):', result);
        return result;
      }
      const result = 'https://your-server.com/api';
      console.log('[API Config] Using fallback (Capacitor Dev):', result);
      return result;
    }
  }
  
  const result = '/api';
  console.log('[API Config] Using relative path (Browser):', result);
  return result;
};

export const API_BASE_URL = getApiBaseUrl();
