export type TokenPair = {
  access_token: string;
  access_token_expires_in: number;
  refresh_token: string;
  refresh_token_expires_at: string;
  access_token_expires_at?: string;
};

export type StoredSession = {
  user: unknown | null;
  permissions: Record<string, boolean>;
  roles: string[];
  tokens: TokenPair | null;
};

const STORAGE_KEY = 'todoapp.session';

const computeAccessTokenExpiresAt = (token: TokenPair): string => {
  const expiresAt = Date.now() + token.access_token_expires_in * 1000;
  return new Date(expiresAt).toISOString();
};

const withComputedExpiresAt = (token: TokenPair): TokenPair => {
  if (token.access_token_expires_at) {
    return token;
  }

  return {
    ...token,
    access_token_expires_at: computeAccessTokenExpiresAt(token),
  };
};

const parseStoredSession = (raw: string | null): StoredSession | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed.tokens) {
      parsed.tokens = withComputedExpiresAt(parsed.tokens);
    }
    parsed.permissions = parsed.permissions ?? {};
    parsed.roles = parsed.roles ?? [];
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored session', error);
    return null;
  }
};

const read = (): StoredSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseStoredSession(window.localStorage.getItem(STORAGE_KEY));
};

const write = (session: StoredSession | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const normalized: StoredSession = {
    user: session.user ?? null,
    permissions: session.permissions ?? {},
    roles: session.roles ?? [],
    tokens: session.tokens ? withComputedExpiresAt(session.tokens) : null,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
};

const clear = (): void => write(null);

export const sessionStore = {
  read,
  write,
  clear,
};

export const isAccessTokenExpired = (token?: TokenPair | null): boolean => {
  if (!token?.access_token) {
    return true;
  }

  if (!token.access_token_expires_at) {
    return false;
  }

  return Date.now() >= new Date(token.access_token_expires_at).getTime();
};

