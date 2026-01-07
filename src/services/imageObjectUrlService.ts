import { sessionStore } from './sessionStore';
import { authService } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

const resolveAccessToken = async (): Promise<string | null> => {
  const validSession = await authService.ensureValidAccessToken();
  if (validSession?.tokens?.access_token) {
    return validSession.tokens.access_token;
  }

  return sessionStore.read()?.tokens?.access_token ?? null;
};

const fetchObjectUrl = async (imageId: string): Promise<string | null> => {
  const accessToken = await resolveAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/image/${imageId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    cache.set(imageId, url);
    return url;
  } catch {
    return null;
  }
};

const getObjectUrl = async (imageId: string | null | undefined): Promise<string | null> => {
  if (!imageId) return null;

  const cached = cache.get(imageId);
  if (cached) return cached;

  const existing = inflight.get(imageId);
  if (existing) return existing;

  const promise = fetchObjectUrl(imageId).finally(() => inflight.delete(imageId));
  inflight.set(imageId, promise);
  return promise;
};

export const imageObjectUrlService = {
  getObjectUrl,
};

