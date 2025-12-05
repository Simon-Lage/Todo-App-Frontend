import { apiClient } from './apiClient';
import type { LogView, PaginatedResponse, SingleResponse, PaginationParams } from '../types/api';

type LogFilters = {
  action?: string;
  performed_by_user_id?: string;
  from?: string;
  to?: string;
  q?: string;
};

const buildQueryString = (filters: LogFilters & PaginationParams): string => {
  const params = new URLSearchParams();

  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.direction) params.append('direction', filters.direction);
  if (filters.action) params.append('action', filters.action);
  if (filters.performed_by_user_id) params.append('performed_by_user_id', filters.performed_by_user_id);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.q) params.append('q', filters.q);

  return params.toString();
};

const list = async (
  filters: LogFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<LogView>> => {
  const query = buildQueryString({ ...filters, ...pagination });
  return apiClient.request<PaginatedResponse<LogView>>({
    path: `/api/logs/list${query ? `?${query}` : ''}`,
    method: 'GET',
  });
};

const getById = async (id: string): Promise<LogView> => {
  const response = await apiClient.request<SingleResponse<LogView>>({
    path: `/api/logs/${id}`,
    method: 'GET',
  });
  return response.data;
};

const getStats = async (): Promise<Record<string, unknown>> => {
  const response = await apiClient.request<SingleResponse<Record<string, unknown>>>({
    path: '/api/logs/stats',
    method: 'GET',
  });
  return response.data;
};

export const logService = {
  list,
  getById,
  getStats,
};
