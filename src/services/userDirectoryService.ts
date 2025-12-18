import { userService } from './userService';
import type { UserListView } from '../types/api';

let cachedUsers: UserListView[] | null = null;
let inflight: Promise<UserListView[]> | null = null;

const loadAllActiveUsers = async (): Promise<UserListView[]> => {
  const pageSize = 200;
  const maxPages = 10;

  let offset = 0;
  let total = 0;
  const items: UserListView[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const response = await userService.list(
      { active: true },
      { offset, limit: pageSize, sort_by: 'name', direction: 'asc' }
    );

    items.push(...response.items);
    total = response.total;

    offset += pageSize;
    if (response.items.length < pageSize || offset >= total) {
      break;
    }
  }

  return items;
};

const getAllUsers = async (): Promise<UserListView[]> => {
  if (cachedUsers) {
    return cachedUsers;
  }

  if (inflight) {
    return inflight;
  }

  inflight = loadAllActiveUsers()
    .then((users) => {
      cachedUsers = users;
      return users;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};

const clearCache = (): void => {
  cachedUsers = null;
  inflight = null;
};

export const userDirectoryService = {
  getAllUsers,
  clearCache,
};

