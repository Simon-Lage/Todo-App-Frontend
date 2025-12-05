import { apiClient } from './apiClient';
import type {
  UserListView,
  ProjectSummaryView,
  TaskSummaryView,
  LogView,
  SingleResponse,
} from '../types/api';

type SearchAllResult = {
  users: UserListView[];
  projects: ProjectSummaryView[];
  tasks: TaskSummaryView[];
  logs: LogView[];
};

type SearchEntityResult<T> = {
  items: T[];
  total: number;
};

const searchAll = async (term: string, limit = 20): Promise<SearchAllResult> => {
  const response = await apiClient.request<SingleResponse<SearchAllResult>>({
    path: `/api/search/${encodeURIComponent(term)}?limit=${limit}`,
    method: 'GET',
  });
  return response.data;
};

const searchUsers = async (term: string, limit = 20, active?: boolean): Promise<UserListView[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (active !== undefined) params.append('active', active.toString());

  const response = await apiClient.request<SingleResponse<SearchEntityResult<UserListView>>>({
    path: `/api/search/user/${encodeURIComponent(term)}?${params.toString()}`,
    method: 'GET',
  });
  return response.data.items;
};

const searchProjects = async (term: string, limit = 20): Promise<ProjectSummaryView[]> => {
  const response = await apiClient.request<SingleResponse<SearchEntityResult<ProjectSummaryView>>>({
    path: `/api/search/project/${encodeURIComponent(term)}?limit=${limit}`,
    method: 'GET',
  });
  return response.data.items;
};

const searchTasks = async (term: string, limit = 20): Promise<TaskSummaryView[]> => {
  const response = await apiClient.request<SingleResponse<SearchEntityResult<TaskSummaryView>>>({
    path: `/api/search/task/${encodeURIComponent(term)}?limit=${limit}`,
    method: 'GET',
  });
  return response.data.items;
};

const searchLogs = async (term: string, limit = 20): Promise<LogView[]> => {
  const response = await apiClient.request<SingleResponse<SearchEntityResult<LogView>>>({
    path: `/api/search/logs/${encodeURIComponent(term)}?limit=${limit}`,
    method: 'GET',
  });
  return response.data.items;
};

const searchComplex = async <T>(payload: {
  entity?: 'user' | 'project' | 'task' | 'logs';
  q: string;
  limit?: number;
  filters?: Record<string, unknown>;
}): Promise<T> => {
  const response = await apiClient.request<SingleResponse<T>>({
    path: '/api/search',
    method: 'POST',
    body: payload,
  });
  return response.data;
};

export const searchService = {
  searchAll,
  searchUsers,
  searchProjects,
  searchTasks,
  searchLogs,
  searchComplex,
};
