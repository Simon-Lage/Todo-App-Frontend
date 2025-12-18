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

  let normalizedPath = path;
  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.substring(4);
  } else if (normalizedPath.startsWith('/api')) {
    normalizedPath = normalizedPath.substring(4);
  }

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

const performFetch = async (config: ApiRequestConfig, accessToken?: string): Promise<Response> => {
  const { path, method = 'GET', body, headers = {}, skipAuth = false } = config;
  const url = buildUrl(path);
  console.log('[API Client] Request URL:', url, 'API_BASE_URL:', API_BASE_URL, 'path:', path);

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
    const contentType = response.headers.get('content-type') || '';
    let errorData: any = {};
    let responseText = '';
    
    try {
      responseText = await response.text();
      if (responseText && responseText.trim() !== '') {
        if (contentType.includes('application/json')) {
          errorData = JSON.parse(responseText);
        } else {
          errorData = { raw: responseText };
        }
      }
    } catch (e) {
      console.error('Failed to parse error response:', e);
      errorData = { raw: responseText || 'Empty response' };
    }
    
    console.group(`🔴 API Error ${response.status}: ${errorData?.title || 'Unknown'}`);
    console.log('Content-Type:', contentType);
    console.log('Response Text:', responseText);
    console.log('Detail:', errorData?.detail);
    console.log('Code:', errorData?.code);
    console.log('Full Response:', errorData);
    if (errorData?.errors) {
      console.log('Errors:', errorData.errors);
    }
    if (errorData?.debug) {
      console.log('Debug Info:', errorData.debug);
    }
    console.groupEnd();
    
    const message = errorData?.detail || errorData?.raw || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return toJson<T>(response);
};

export const apiClient = {
  request,
};
