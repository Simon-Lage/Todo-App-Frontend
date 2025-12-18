import { authService } from './authService';
import { sessionStore, isAccessTokenExpired } from './sessionStore';
import { API_BASE_URL } from '../config/apiConfig';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiRequestConfig = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

const toJson = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json() as Promise<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {} as any;
};

const buildUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }

  if (path.startsWith('/')) {
    if (API_BASE_URL.startsWith('http')) {
      return `${API_BASE_URL}${path}`;
    }
    return path;
  }

  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const performFetch = async (config: ApiRequestConfig, accessToken?: string): Promise<Response> => {
  const { path, method = 'GET', body, headers = {}, skipAuth = false } = config;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth && accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  return fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
};

const request = async <T>(config: ApiRequestConfig): Promise<T> => {
  const initialSession = authService.getSession();
  const tokens = initialSession?.tokens;
  let accessToken = tokens?.access_token;

  if (accessToken && isAccessTokenExpired(tokens)) {
    const refreshed = await authService.ensureValidAccessToken();
    accessToken = refreshed?.tokens?.access_token;
  }

  const response = await performFetch(config, accessToken);

  if (response.status === 401) {
    const currentSession = authService.getSession();
    const currentRefreshToken = currentSession?.tokens?.refresh_token;
    
    if (currentRefreshToken) {
      const refreshed = await authService.ensureValidAccessToken();
      const retryToken = refreshed?.tokens?.access_token;

      if (retryToken) {
        const retryResponse = await performFetch(config, retryToken);
        if (retryResponse.ok) {
          return toJson<T>(retryResponse);
        }
        if (retryResponse.status === 401) {
          sessionStore.clear();
        }
        
        const errorData = await toJson<any>(retryResponse);
        if (errorData?.debug) {
          console.group(`🔴 API Error ${retryResponse.status}: ${errorData.title || 'Unknown'}`);
          console.log('Detail:', errorData.detail);
          console.log('Code:', errorData.code);
          if (errorData.errors) {
            console.log('Errors:', errorData.errors);
          }
          console.log('Debug Info:', errorData.debug);
          console.groupEnd();
        }
        
        const message = errorData?.detail || `Request failed with status ${retryResponse.status}`;
        throw new Error(message);
      }
    }
  }

  if (!response.ok) {
    const errorData = await toJson<any>(response);
    
    if (errorData?.debug) {
      console.group(`🔴 API Error ${response.status}: ${errorData.title || 'Unknown'}`);
      console.log('Detail:', errorData.detail);
      console.log('Code:', errorData.code);
      if (errorData.errors) {
        console.log('Errors:', errorData.errors);
      }
      console.log('Debug Info:', errorData.debug);
      console.groupEnd();
    }
    
    const message = errorData?.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return toJson<T>(response);
};

export const apiClient = {
  request,
};
