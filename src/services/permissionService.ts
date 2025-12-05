import { apiClient } from './apiClient';
import type { PermissionMap, PermissionKey, SingleResponse } from '../types/api';

let cachedPermissions: PermissionMap | null = null;
let cachedCatalog: { items: PermissionKey[]; roles: string[] } | null = null;

const getCatalog = async (): Promise<{ items: PermissionKey[]; roles: string[] }> => {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const response = await apiClient.request<SingleResponse<{ items: PermissionKey[]; roles: string[] }>>({
    path: '/api/permission/catalog',
    method: 'GET',
  });

  cachedCatalog = response.data;
  return response.data;
};

const resolve = async (): Promise<PermissionMap> => {
  if (cachedPermissions) {
    return cachedPermissions;
  }

  const response = await apiClient.request<SingleResponse<PermissionMap>>({
    path: '/api/user/permissions',
    method: 'GET',
  });

  cachedPermissions = response.data;
  return response.data;
};

const has = async (permission: PermissionKey): Promise<boolean> => {
  const permissions = await resolve();
  return permissions[permission] === true;
};

const hasAll = async (permissions: PermissionKey[]): Promise<boolean> => {
  const permissionMap = await resolve();
  return permissions.every((perm) => permissionMap[perm] === true);
};

const hasAny = async (permissions: PermissionKey[]): Promise<boolean> => {
  const permissionMap = await resolve();
  return permissions.some((perm) => permissionMap[perm] === true);
};

const getAssignedRoles = async (): Promise<string[]> => {
  const catalog = await getCatalog();
  return catalog.roles;
};

const clearCache = (): void => {
  cachedPermissions = null;
  cachedCatalog = null;
};

export const permissionService = {
  getCatalog,
  resolve,
  has,
  hasAll,
  hasAny,
  getAssignedRoles,
  clearCache,
};
