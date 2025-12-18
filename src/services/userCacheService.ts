import { userService } from './userService';
import type { UserView, UserListView } from '../types/api';

const userCache = new Map<string, UserListView | UserView>();

const getUserById = async (userId: string): Promise<UserListView | null> => {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  try {
    const user = await userService.getById(userId);
    const userListView: UserListView = {
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      profile_image_id: user.profile_image_id ?? null,
      roles: user.roles,
    };
    userCache.set(userId, userListView);
    return userListView;
  } catch (error) {
    console.error(`Failed to load user ${userId}:`, error);
    return null;
  }
};

const getUsersByIds = async (userIds: string[]): Promise<Map<string, UserListView>> => {
  const result = new Map<string, UserListView>();
  const uncachedIds: string[] = [];

  for (const userId of userIds) {
    if (userCache.has(userId)) {
      result.set(userId, userCache.get(userId)!);
    } else {
      uncachedIds.push(userId);
    }
  }

  if (uncachedIds.length > 0) {
    const loadPromises = uncachedIds.map(async (userId) => {
      const user = await getUserById(userId);
      if (user) {
        result.set(userId, user);
      }
    });
    await Promise.all(loadPromises);
  }

  return result;
};

const clearCache = (): void => {
  userCache.clear();
};

const invalidateUser = (userId: string): void => {
  userCache.delete(userId);
};

export const userCacheService = {
  getUserById,
  getUsersByIds,
  clearCache,
  invalidateUser,
};
