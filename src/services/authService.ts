import { sessionStore, StoredSession, TokenPair, isAccessTokenExpired } from './sessionStore';
import { apiClient } from './apiClient';
import { permissionService } from './permissionService';
import { userDirectoryService } from './userDirectoryService';

type LoginPayload = { email: string; password: string };

type AuthResponse = {
  data?: {
    tokens?: TokenPair;
    user?: unknown;
    permissions?: Record<string, boolean>;
  };
};

let refreshPromise: Promise<StoredSession | null> | null = null;

const extractRoleNames = (user: unknown): string[] => {
  if (!user || typeof user !== 'object' || !('roles' in user)) {
    return [];
  }

  const roles = (user as { roles?: Array<{ id?: string; name?: string | null }> }).roles ?? [];
  return roles
    .map((role) => (role?.name ?? role?.id ?? '').toString().trim())
    .filter((value) => value.length > 0);
};

const buildSession = (payload: AuthResponse['data']): StoredSession | null => {
  if (!payload?.tokens?.access_token || !payload?.tokens?.refresh_token) {
    return null;
  }

  const roles = extractRoleNames(payload.user);

  return {
    tokens: payload.tokens,
    user: payload.user ?? null,
    permissions: payload.permissions ?? {},
    roles,
  };
};

const login = async (payload: LoginPayload): Promise<StoredSession> => {
  const response = await apiClient.request<AuthResponse>({
    path: '/auth/login',
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

  const session = buildSession(response.data);

  if (!session) {
    throw new Error('Login response missing tokens.');
  }

  permissionService.clearCache();
  userDirectoryService.clearCache();
  sessionStore.write(session);
  return session;
};

const refresh = async (refreshToken: string): Promise<StoredSession | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentSession = sessionStore.read();
      const response = await apiClient.request<AuthResponse>({
        path: '/auth/refresh',
        method: 'POST',
        body: { refresh_token: refreshToken },
        skipAuth: true,
      });

      const refreshedSession = buildSession(response.data);
      if (!refreshedSession) {
        return null;
      }

      const mergedSession: StoredSession = {
        user: currentSession?.user ?? null,
        permissions: currentSession?.permissions ?? {},
        roles: refreshedSession.roles.length > 0 ? refreshedSession.roles : (currentSession?.roles ?? []),
        ...refreshedSession,
      };

      sessionStore.write(mergedSession);
      return mergedSession;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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

const logout = async (): Promise<void> => {
  const current = sessionStore.read();
  const refreshToken = current?.tokens?.refresh_token;

  try {
    await ensureValidAccessToken();
    if (refreshToken) {
      await apiClient.request({
        path: '/auth/logout',
        method: 'POST',
        body: { refresh_token: refreshToken },
      });
    }
  } catch (error) {
    console.warn('Logout request failed', error);
  } finally {
    permissionService.clearCache();
    userDirectoryService.clearCache();
    sessionStore.clear();
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

const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await apiClient.request({
    path: '/auth/change-password',
    method: 'POST',
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
  });
};

export const authService = {
  login,
  logout,
  refresh,
  getSession,
  setSession,
  ensureValidAccessToken,
  changePassword,
};
