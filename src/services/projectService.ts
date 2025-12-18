import { apiClient } from './apiClient';
import type {
  ProjectView,
  ProjectSummaryView,
  TaskSummaryView,
  PaginatedResponse,
  SingleResponse,
  ProjectFilters,
  PaginationParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  TaskFilters,
  ProjectStatsView,
} from '../types/api';

const buildQueryString = (filters: ProjectFilters & PaginationParams): string => {
  const params = new URLSearchParams();

  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.direction) params.append('direction', filters.direction);
  if (filters.q) params.append('q', filters.q);
  if (filters.created_by_user_id) params.append('created_by_user_id', filters.created_by_user_id);

  return params.toString();
};

const list = async (
  filters: ProjectFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<ProjectSummaryView>> => {
  const query = buildQueryString({ ...filters, ...pagination });
  return apiClient.request<PaginatedResponse<ProjectSummaryView>>({
    path: `/api/project/list${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const listMy = async (
  filters: Pick<ProjectFilters, 'q'> = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<ProjectSummaryView>> => {
  const params = new URLSearchParams();
  if (pagination.offset !== undefined) params.append('offset', pagination.offset.toString());
  if (pagination.limit !== undefined) params.append('limit', pagination.limit.toString());
  if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
  if (pagination.direction) params.append('direction', pagination.direction);
  if (filters.q) params.append('q', filters.q);

  const query = params.toString();
  return apiClient.request<PaginatedResponse<ProjectSummaryView>>({
    path: `/api/project/my${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const joinAsTeamLead = async (projectId: string): Promise<ProjectView> => {
  const response = await apiClient.request<SingleResponse<ProjectView>>({
    path: `/api/project/${projectId}/teamleads/me`,
    method: 'POST',
  });
  return response.data;
};

const complete = async (projectId: string): Promise<ProjectView> => {
  const response = await apiClient.request<SingleResponse<ProjectView>>({
    path: `/api/project/${projectId}/complete`,
    method: 'POST',
  });
  return response.data;
};

const getById = async (id: string): Promise<ProjectView> => {
  const response = await apiClient.request<SingleResponse<ProjectView>>({
    path: `/api/project/${id}`,
    method: 'GET',
  });
  return response.data;
};

const create = async (payload: CreateProjectPayload): Promise<ProjectView> => {
  const response = await apiClient.request<SingleResponse<ProjectView>>({
    path: '/api/project',
    method: 'POST',
    body: payload,
  });
  return response.data;
};

const update = async (id: string, payload: UpdateProjectPayload): Promise<ProjectView> => {
  const response = await apiClient.request<SingleResponse<ProjectView>>({
    path: `/api/project/${id}`,
    method: 'PATCH',
    body: payload,
  });
  return response.data;
};

const deleteProject = async (id: string): Promise<void> => {
  await apiClient.request({
    path: `/api/project/${id}`,
    method: 'DELETE',
  });
};

const getTasks = async (
  projectId: string,
  filters: TaskFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<TaskSummaryView>> => {
  const mergedPagination: PaginationParams = {
    sort_by: pagination.sort_by ?? 'status',
    direction: pagination.direction ?? 'desc',
    offset: pagination.offset,
    limit: pagination.limit,
  };

  const params = new URLSearchParams();

  if (mergedPagination.offset !== undefined) params.append('offset', mergedPagination.offset.toString());
  if (mergedPagination.limit !== undefined) params.append('limit', mergedPagination.limit.toString());
  if (mergedPagination.sort_by) params.append('sort_by', mergedPagination.sort_by);
  if (mergedPagination.direction) params.append('direction', mergedPagination.direction);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assigned_to_user_id) params.append('assigned_to_user_id', filters.assigned_to_user_id);
  if (filters.created_by_user_id) params.append('created_by_user_id', filters.created_by_user_id);
  if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
  if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
  if (filters.q) params.append('q', filters.q);

  const query = params.toString();
  return apiClient.request<PaginatedResponse<TaskSummaryView>>({
    path: `/api/project/${projectId}/tasks${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getStats = async (id: string): Promise<ProjectStatsView> => {
  const response = await apiClient.request<SingleResponse<ProjectStatsView>>({
    path: `/api/project/${id}/stats`,
    method: 'GET',
  });
  return response.data;
};

export const projectService = {
  list,
  listMy,
  getById,
  create,
  update,
  delete: deleteProject,
  getTasks,
  getStats,
  joinAsTeamLead,
  complete,
};
