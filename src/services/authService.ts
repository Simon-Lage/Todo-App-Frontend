import { sessionStore, StoredSession, TokenPair, isAccessTokenExpired } from './sessionStore';

type LoginPayload = { email: string; password: string };

type AuthResponse = {
  data?: {
    tokens?: TokenPair;
    user?: unknown;
    permissions?: Record<string, boolean>;
  };
};

const API_BASE = '/api/auth';

const parseAuthResponse = (response: Response): Promise<AuthResponse> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<AuthResponse>;
  }
  return Promise.resolve({});
};

const buildSession = (payload: AuthResponse['data']): StoredSession | null => {
  if (!payload?.tokens?.access_token || !payload?.tokens?.refresh_token) {
    return null;
  }

  return {
    tokens: payload.tokens,
    user: payload.user ?? null,
    permissions: payload.permissions ?? {},
    roles: [],
  };
};

const postJson = async (path: string, body: unknown): Promise<Response> => {
  return fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

const login = async (payload: LoginPayload): Promise<StoredSession> => {
  const res = await postJson(`${API_BASE}/login`, payload);
  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}`);
  }

  const json = await parseAuthResponse(res);
  const session = buildSession(json.data);

  if (!session) {
    throw new Error('Login response missing tokens.');
  }

  sessionStore.write(session);
  return session;
};

const refresh = async (refreshToken: string): Promise<StoredSession | null> => {
  const res = await postJson(`${API_BASE}/refresh`, { refresh_token: refreshToken });
  if (!res.ok) {
    return null;
  }

  const json = await parseAuthResponse(res);
  const session = buildSession(json.data);
  if (!session) {
    return null;
  }

  sessionStore.write(session);
  return session;
};

const logout = async (): Promise<void> => {
  const current = sessionStore.read();
  const refreshToken = current?.tokens?.refresh_token;

  sessionStore.clear();

  if (!refreshToken) {
    return;
  }

  try {
    await postJson(`${API_BASE}/logout`, { refresh_token: refreshToken });
  } catch (error) {
    console.warn('Logout request failed', error);
  }
};

const getSession = (): StoredSession | null => sessionStore.read();

const setSession = (next: StoredSession | null): void => {
  if (next) {
    sessionStore.write(next);
  } else {
    sessionStore.clear();
  }
};

const ensureValidAccessToken = async (): Promise<StoredSession | null> => {
  const current = sessionStore.read();
  const token = current?.tokens;

  if (!token) {
    return null;
  }

  if (!isAccessTokenExpired(token)) {
    return current;
  }

  if (!token.refresh_token) {
    sessionStore.clear();
    return null;
  }

  const refreshed = await refresh(token.refresh_token);
  if (!refreshed) {
    sessionStore.clear();
  }
  return refreshed;
};

export const authService = {
  login,
  logout,
  refresh,
  getSession,
  setSession,
  ensureValidAccessToken,
};
