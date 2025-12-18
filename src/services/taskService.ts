import { apiClient } from './apiClient';
import type {
  TaskView,
  TaskSummaryView,
  PaginatedResponse,
  SingleResponse,
  TaskFilters,
  PaginationParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskBeautifyResponse,
} from '../types/api';

const buildQueryString = (filters: TaskFilters & PaginationParams): string => {
  const params = new URLSearchParams();

  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.direction) params.append('direction', filters.direction);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.project_id) params.append('project_id', filters.project_id);
  if (filters.assigned_to_user_id) params.append('assigned_to_user_id', filters.assigned_to_user_id);
  if (filters.created_by_user_id) params.append('created_by_user_id', filters.created_by_user_id);
  if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
  if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
  if (filters.q) params.append('q', filters.q);

  return params.toString();
};

const list = async (
  filters: TaskFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<TaskSummaryView>> => {
  const mergedPagination: PaginationParams = {
    sort_by: pagination.sort_by ?? 'status',
    direction: pagination.direction ?? 'desc',
    offset: pagination.offset,
    limit: pagination.limit,
  };

  const query = buildQueryString({ ...filters, ...mergedPagination });
  return apiClient.request<PaginatedResponse<TaskSummaryView>>({
    path: `/api/task/list${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getById = async (id: string): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${id}`,
    method: 'GET',
  });
  return response.data;
};

const create = async (payload: CreateTaskPayload): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: '/api/task',
    method: 'POST',
    body: payload,
  });
  return response.data;
};

const update = async (id: string, payload: UpdateTaskPayload): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${id}`,
    method: 'PATCH',
    body: payload,
  });
  return response.data;
};

const deleteTask = async (id: string): Promise<void> => {
  await apiClient.request({
    path: `/api/task/${id}`,
    method: 'DELETE',
  });
};

const assignUser = async (taskId: string, userId: string): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/assign-user`,
    method: 'POST',
    body: { user_id: userId },
  });
  return response.data;
};

const assignUsers = async (taskId: string, userIds: string[]): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/assign-users`,
    method: 'POST',
    body: { user_ids: userIds },
  });
  return response.data;
};

const unassignUser = async (taskId: string, userId: string): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/unassign-user`,
    method: 'POST',
    body: { user_id: userId },
  });
  return response.data;
};

const clearAssignees = async (taskId: string): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/clear-assignees`,
    method: 'POST',
  });
  return response.data;
};

const moveToProject = async (taskId: string, projectId: string): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/move-to-project`,
    method: 'POST',
    body: { project_id: projectId },
  });
  return response.data;
};

const updateStatus = async (taskId: string, status: TaskStatus): Promise<TaskView> => {
  const response = await apiClient.request<SingleResponse<TaskView>>({
    path: `/api/task/${taskId}/status`,
    method: 'POST',
    body: { status },
  });
  return response.data;
};

const beautifyDescription = async (payload: { title?: string; description: string }): Promise<string> => {
  const response = await apiClient.request<SingleResponse<TaskBeautifyResponse>>({
    path: '/api/task/beautify-text',
    method: 'POST',
    body: {
      title: payload.title ?? null,
      description: payload.description,
    },
  });

  return response.data.suggestion;
};

const getDashboardStats = async (): Promise<{
  my_tasks_total: number;
  my_tasks_in_progress: number;
  my_tasks_done_total: number;
}> => {
  const response = await apiClient.request<
    SingleResponse<{ my_tasks_total: number; my_tasks_in_progress: number; my_tasks_done_total: number }>
  >({
    path: '/api/task/dashboard-stats',
    method: 'GET',
  });
  return response.data;
};

export const taskService = {
  list,
  getById,
  create,
  update,
  delete: deleteTask,
  assignUser,
  assignUsers,
  unassignUser,
  clearAssignees,
  moveToProject,
  updateStatus,
  beautifyDescription,
  getDashboardStats,
};
