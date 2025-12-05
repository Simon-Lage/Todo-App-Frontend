import { apiClient } from './apiClient';
import type {
  UserView,
  UserListView,
  TaskSummaryView,
  ProjectSummaryView,
  PaginatedResponse,
  SingleResponse,
  UserFilters,
  PaginationParams,
  CreateUserPayload,
  UpdateUserPayload,
  SelfUpdateUserPayload,
  PermissionMap,
} from '../types/api';

const buildQueryString = (filters: UserFilters & PaginationParams): string => {
  const params = new URLSearchParams();

  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.direction) params.append('direction', filters.direction);
  if (filters.q) params.append('q', filters.q);
  if (filters.active !== undefined) params.append('active', filters.active.toString());
  if (filters.role_id) params.append('role_id', filters.role_id);

  return params.toString();
};

const getCurrentUser = async (): Promise<{ user: UserView; permissions: PermissionMap }> => {
  const response = await apiClient.request<SingleResponse<{ user: UserView; permissions: PermissionMap }>>({
    path: '/api/user',
    method: 'GET',
  });
  return response.data;
};

const getPermissions = async (): Promise<PermissionMap> => {
  const response = await apiClient.request<SingleResponse<PermissionMap>>({
    path: '/api/user/permissions',
    method: 'GET',
  });
  return response.data;
};

const getById = async (id: string): Promise<UserView> => {
  const response = await apiClient.request<SingleResponse<UserView>>({
    path: `/api/user/${id}`,
    method: 'GET',
  });
  return response.data;
};

const list = async (
  filters: UserFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<UserListView>> => {
  const query = buildQueryString({ ...filters, ...pagination });
  return apiClient.request<PaginatedResponse<UserListView>>({
    path: `/api/user/list${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getByRole = async (roleId: string): Promise<UserListView[]> => {
  const response = await apiClient.request<SingleResponse<{ items: UserListView[]; total: number }>>({
    path: `/api/user/by-role/${roleId}`,
    method: 'GET',
  });
  return response.data.items;
};

const create = async (payload: CreateUserPayload): Promise<UserView> => {
  const response = await apiClient.request<SingleResponse<{ user: UserView }>>({
    path: '/api/user',
    method: 'POST',
    body: payload,
  });
  return response.data.user;
};

const updateSelf = async (payload: SelfUpdateUserPayload): Promise<UserView> => {
  const response = await apiClient.request<SingleResponse<UserView>>({
    path: '/api/user',
    method: 'PATCH',
    body: { name: payload.name },
  });
  return response.data;
};

const updateAdmin = async (id: string, payload: UpdateUserPayload): Promise<UserView> => {
  const response = await apiClient.request<SingleResponse<UserView>>({
    path: `/api/user/${id}`,
    method: 'PATCH',
    body: payload,
  });
  return response.data;
};

const deactivate = async (id: string): Promise<void> => {
  await apiClient.request({
    path: `/api/user/${id}/deactivate`,
    method: 'POST',
  });
};

const reactivate = async (id: string): Promise<void> => {
  await apiClient.request({
    path: `/api/user/${id}/reactivate`,
    method: 'POST',
  });
};

const resetPasswordSelf = async (): Promise<void> => {
  await apiClient.request({
    path: '/api/user/reset-password',
    method: 'POST',
  });
};

const verifyEmailForPasswordReset = async (userId: string, email: string): Promise<void> => {
  await apiClient.request({
    path: `/api/user/verify-email-for-password-reset/${userId}`,
    method: 'POST',
    body: { email },
  });
};

const getTasks = async (userId: string, pagination: PaginationParams = {}): Promise<PaginatedResponse<TaskSummaryView>> => {
  const params = new URLSearchParams();

  if (pagination.offset !== undefined) params.append('offset', pagination.offset.toString());
  if (pagination.limit !== undefined) params.append('limit', pagination.limit.toString());
  if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
  if (pagination.direction) params.append('direction', pagination.direction);

  const query = params.toString();
  return apiClient.request<PaginatedResponse<TaskSummaryView>>({
    path: `/api/user/${userId}/tasks${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getProjects = async (userId: string, pagination: PaginationParams = {}): Promise<PaginatedResponse<ProjectSummaryView>> => {
  const params = new URLSearchParams();

  if (pagination.offset !== undefined) params.append('offset', pagination.offset.toString());
  if (pagination.limit !== undefined) params.append('limit', pagination.limit.toString());
  if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
  if (pagination.direction) params.append('direction', pagination.direction);

  const query = params.toString();
  return apiClient.request<PaginatedResponse<ProjectSummaryView>>({
    path: `/api/user/${userId}/projects${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

export const userService = {
  getCurrentUser,
  getPermissions,
  getById,
  list,
  getByRole,
  create,
  updateSelf,
  updateAdmin,
  deactivate,
  reactivate,
  resetPasswordSelf,
  verifyEmailForPasswordReset,
  getTasks,
  getProjects,
};
