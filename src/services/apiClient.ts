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

const CODE_MESSAGES: Record<string, string> = {
  SESSION_EXPIRED: 'Die Sitzung ist abgelaufen. Bitte erneut anmelden.',
  TOKEN_INVALID: 'Die Sitzung ist ungültig. Bitte erneut anmelden.',
  TOKEN_MISSING: 'Keine gültige Sitzung gefunden.',
  PERMISSION_DENIED: 'Keine Berechtigung für diese Aktion.',
  RESOURCE_NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  VALIDATION_ERROR: 'Eingabe ungültig. Bitte Angaben prüfen.',
  CONFLICT: 'Konflikt: Die Daten stehen im Widerspruch zu bestehenden Werten.',
  PAYLOAD_TOO_LARGE: 'Die übermittelte Datei/Daten sind zu groß.',
  RATE_LIMITED: 'Zu viele Anfragen. Bitte später erneut versuchen.',
  INTERNAL_ERROR: 'Interner Fehler. Bitte später erneut versuchen.',
  USED_ACCOUNT_IS_INACTIVE: 'Dieses Benutzerkonto ist inaktiv.',
  WRONG_LOGIN_DATA: 'E-Mail oder Passwort sind falsch.',
  EMAIL_DOES_NOT_MATCH: 'Die E-Mail-Adresse passt nicht zum Konto.',
  EMAIL_ALREADY_IN_USE: 'Diese E-Mail wird bereits verwendet.',
  USERNAME_ALREADY_IN_USE: 'Dieser Benutzername wird bereits verwendet.',
  ALREADY_PROJECT_WITH_THIS_NAME: 'Projektname ist bereits vergeben.',
  ALREADY_TASK_WITH_THIS_NAME: 'Titel ist bereits vergeben.',
};

const translateValidationErrors = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const firstField = Object.keys(errors as Record<string, unknown>)[0];
  if (!firstField) {
    return null;
  }

  const messages = (errors as Record<string, unknown>)[firstField];
  if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
    return `${firstField}: ${messages[0]}`;
  }

  return null;
};

const toUserMessage = (errorData: any, fallbackStatus: number): string => {
  const code: string | undefined = errorData?.code;
  if (code && CODE_MESSAGES[code]) {
    if (code === 'VALIDATION_ERROR') {
      const detail = translateValidationErrors(errorData?.errors);
      return detail ? `${CODE_MESSAGES[code]} (${detail})` : CODE_MESSAGES[code];
    }
    return CODE_MESSAGES[code];
  }

  if (fallbackStatus === 405) {
    if (import.meta.env.DEV) {
      // In Dev: technische Info in der Konsole lassen, Nutzertext bleibt generisch.
      console.error('HTTP 405 – Method not allowed', { errorData });
    }
    return 'Aktion aktuell nicht möglich. Bitte später erneut versuchen.';
  }

  const validationDetail = translateValidationErrors(errorData?.errors);
  if (validationDetail) {
    return validationDetail;
  }

  if (typeof errorData?.detail === 'string' && errorData.detail.trim() !== '') {
    return errorData.detail;
  }

  if (typeof errorData?.raw === 'string' && errorData.raw.trim() !== '') {
    return errorData.raw;
  }

  return `Anfrage fehlgeschlagen (Status ${fallbackStatus})`;
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

  let response: Response;
  try {
    response = await performFetch(config, accessToken);
  } catch (networkError) {
    const message =
      networkError instanceof TypeError
        ? 'Server nicht erreichbar. Bitte Verbindung prüfen.'
        : 'Netzwerkfehler. Bitte erneut versuchen.';
    throw new Error(message);
  }

  if (response.status === 401) {
    const currentSession = authService.getSession();
    const currentRefreshToken = currentSession?.tokens?.refresh_token;
    
    if (currentRefreshToken) {
      const refreshed = await authService.ensureValidAccessToken();
      const retryToken = refreshed?.tokens?.access_token;

      if (retryToken) {
        let retryResponse: Response;
        try {
          retryResponse = await performFetch(config, retryToken);
        } catch (networkError) {
          const message =
            networkError instanceof TypeError
              ? 'Server nicht erreichbar. Bitte Verbindung prüfen.'
              : 'Netzwerkfehler. Bitte erneut versuchen.';
          throw new Error(message);
        }
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
        
        const message = toUserMessage(errorData, retryResponse.status);
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
    
    const message = toUserMessage(errorData, response.status);
    throw new Error(message);
  }

  return toJson<T>(response);
};

export const apiClient = {
  request,
};
