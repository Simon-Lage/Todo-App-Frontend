import { apiClient } from './apiClient';
import type {
  RoleView,
  PaginatedResponse,
  SingleResponse,
  PaginationParams,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/api';

const list = async (pagination: PaginationParams = {}): Promise<PaginatedResponse<RoleView>> => {
  const params = new URLSearchParams();

  if (pagination.offset !== undefined) params.append('offset', pagination.offset.toString());
  if (pagination.limit !== undefined) params.append('limit', pagination.limit.toString());

  const query = params.toString();
  return apiClient.request<PaginatedResponse<RoleView>>({
    path: `/api/role/list${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getById = async (id: string): Promise<RoleView> => {
  const response = await apiClient.request<SingleResponse<RoleView>>({
    path: `/api/role/${id}`,
    method: 'GET',
  });
  return response.data;
};

const create = async (payload: CreateRolePayload): Promise<RoleView> => {
  const flattenedPermissions = payload.permissions ? { ...payload.permissions } : {};
  const response = await apiClient.request<SingleResponse<RoleView>>({
    path: '/api/role',
    method: 'POST',
    body: {
      name: payload.name,
      ...flattenedPermissions,
    },
  });
  return response.data;
};

const update = async (id: string, payload: UpdateRolePayload): Promise<RoleView> => {
  const flattenedPermissions = payload.permissions ? { ...payload.permissions } : undefined;
  const response = await apiClient.request<SingleResponse<RoleView>>({
    path: `/api/role/${id}`,
    method: 'PATCH',
    body: {
      ...(payload.name ? { name: payload.name } : {}),
      ...(flattenedPermissions ?? {}),
    },
  });
  return response.data;
};

const deleteRole = async (id: string): Promise<void> => {
  await apiClient.request({
    path: `/api/role/${id}`,
    method: 'DELETE',
  });
};

const getByUser = async (userId: string): Promise<RoleView[]> => {
  const response = await apiClient.request<SingleResponse<{ items: RoleView[]; total: number }>>({
    path: `/api/role/by-user/${userId}`,
    method: 'GET',
  });
  return response.data.items;
};

const assignToUser = async (userId: string, roleIds: string[]): Promise<RoleView[]> => {
  const response = await apiClient.request<SingleResponse<{ user_id: string; roles: RoleView[] }>>({
    path: `/api/role/by-user/${userId}`,
    method: 'PATCH',
    body: { roles: roleIds },
  });
  return response.data.roles;
};

export const roleService = {
  list,
  getById,
  create,
  update,
  delete: deleteRole,
  getByUser,
  assignToUser,
};
