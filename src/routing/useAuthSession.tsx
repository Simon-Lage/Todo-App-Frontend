import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';
import { sessionStore, StoredSession } from '../services/sessionStore';

export type AuthSession = {
  user: unknown | null;
  permissions: Record<string, boolean>;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authSession: AuthSession;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
};

const defaultAuthSession: AuthSession = {
  user: null,
  permissions: {},
  roles: [],
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const toAuthSession = (session: StoredSession | null): AuthSession => ({
  user: session?.user ?? null,
  permissions: session?.permissions ?? {},
  roles: session?.roles ?? [],
  accessToken: session?.tokens?.access_token ?? null,
  refreshToken: session?.tokens?.refresh_token ?? null,
  isAuthenticated: Boolean(session?.tokens?.access_token),
});

const fetchCurrentUser = async (): Promise<{ user: unknown; permissions: Record<string, boolean> }> => {
  const response = await apiClient.request<{ data?: { user?: unknown; permissions?: Record<string, boolean> } }>({
    path: '/api/user',
    method: 'GET',
  });

  const data = response.data ?? {};
  return {
    user: data.user ?? null,
    permissions: data.permissions ?? {},
  };
};

const fetchRoles = async (): Promise<string[]> => {
  const permissions = sessionStore.read()?.permissions ?? {};
  if (!permissions['perm_can_edit_user']) {
    return [];
  }

  try {
    const response = await apiClient.request<{ data?: { roles?: string[] } }>({
      path: '/api/permission/catalog',
      method: 'GET',
    });
    return response.data?.roles ?? [];
  } catch (error) {
    console.warn('Fetching roles failed', error);
    return [];
  }
};

const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StoredSession | null>(() => sessionStore.read());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistAndSet = useCallback((next: StoredSession | null) => {
    setSession(next);
    if (next) {
      sessionStore.write(next);
    } else {
      sessionStore.clear();
    }
  }, []);

  const initializeSession = useCallback(async () => {
    const stored = sessionStore.read();
    if (!stored?.tokens?.access_token) {
      persistAndSet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const validSession = await authService.ensureValidAccessToken();
      if (!validSession?.tokens?.access_token) {
        persistAndSet(null);
        setLoading(false);
        return;
      }

      const needProfile = !validSession.user || Object.keys(validSession.permissions ?? {}).length === 0;
      const needRoles = (validSession.roles ?? []).length === 0;

      let nextSession: StoredSession = { ...validSession, roles: validSession.roles ?? [] };

      if (needProfile) {
        const { user, permissions } = await fetchCurrentUser();
        nextSession = { ...nextSession, user, permissions };
      }

      if (needRoles) {
        const roles = await fetchRoles();
        nextSession = { ...nextSession, roles };
      }

      persistAndSet(nextSession);
    } catch (err) {
      console.warn('Initialize session failed', err);
      persistAndSet(null);
      setError(err instanceof Error ? err.message : 'Session error');
    } finally {
      setLoading(false);
    }
  }, [persistAndSet]);

  useEffect(() => {
    void initializeSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const nextSession = await authService.login({ email, password });
        const { user, permissions } = await fetchCurrentUser();
        const roles = await fetchRoles();
        persistAndSet({ ...nextSession, user, permissions, roles });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persistAndSet]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    await authService.logout();
    persistAndSet(null);
    setLoading(false);
  }, [persistAndSet]);

  const refreshSession = useCallback(async () => {
    await initializeSession();
  }, [initializeSession]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    authSession: toAuthSession(session),
    loading,
    error,
    login,
    logout,
    refreshSession,
    clearError,
  }), [session, loading, error, login, logout, refreshSession, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthSession = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }
  return ctx;
};

export { AuthSessionProvider };
