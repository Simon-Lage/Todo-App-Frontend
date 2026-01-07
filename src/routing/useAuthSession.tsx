import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { sessionStore, StoredSession } from '../services/sessionStore';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import type { UserView } from '../types/api';

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

const extractRoleNames = (user: unknown): string[] => {
  if (!user || typeof user !== 'object' || !('roles' in user)) {
    return [];
  }

  const roles = (user as { roles?: Array<{ id?: string; name?: string | null }> }).roles ?? [];
  return roles
    .map((role) => (role?.name ?? role?.id ?? '').toString().trim())
    .filter((value) => value.length > 0);
};

const fetchCurrentUserWithPermissions = async (): Promise<{
  user: UserView | null;
  permissions: Record<string, boolean>;
}> => {
  const { user, permissions } = await userService.getCurrentUser();
  if (permissions && Object.keys(permissions).length > 0) {
    return { user, permissions };
  }

  const fallbackPermissions = await userService.getPermissions();
  return { user, permissions: fallbackPermissions };
};

const fetchUserRoles = async (userId: string | null): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  try {
    const roles = await roleService.getByUser(userId);
    return roles
      .map((role) => (role.name ?? role.id ?? '').toString().trim())
      .filter((value) => value.length > 0);
  } catch (error) {
    console.warn('Fetching roles for user failed', error);
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

      const hasPermissions = Object.keys(validSession.permissions ?? {}).length > 0;
      const hasUser = Boolean(validSession.user);
      const { user, permissions } = await fetchCurrentUserWithPermissions();
      const mergedUser = hasUser ? (validSession.user as UserView) : user;
      const mergedPermissions = hasPermissions ? validSession.permissions : permissions;
      const roleNamesFromUser = extractRoleNames(mergedUser);
      const roles =
        roleNamesFromUser.length > 0
          ? roleNamesFromUser
          : await fetchUserRoles((mergedUser as UserView | null)?.id ?? null);

      const nextSession: StoredSession = {
        ...validSession,
        user: mergedUser,
        permissions: mergedPermissions,
        roles,
      };

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
        const { user, permissions } = await fetchCurrentUserWithPermissions();
        const roleNamesFromUser = extractRoleNames(user);
        const roles =
          roleNamesFromUser.length > 0
            ? roleNamesFromUser
            : await fetchUserRoles((user as UserView | null)?.id ?? null);

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
