import { apiClient } from './apiClient';
import type { SingleResponse } from '../types/api';

type PrioritiesResponse = {
  priorities: Record<string, string>;
  statuses: Record<string, string>;
};

let cachedPriorities: PrioritiesResponse | null = null;

const getPriorities = async (): Promise<PrioritiesResponse> => {
  if (cachedPriorities) {
    return cachedPriorities;
  }

  const response = await apiClient.request<SingleResponse<PrioritiesResponse>>({
    path: '/api/priorities',
    method: 'GET',
  });

  cachedPriorities = response.data;
  return response.data;
};

const getPrioritiesList = async (): Promise<Record<string, string>> => {
  const data = await getPriorities();
  return data.priorities;
};

const getStatusesList = async (): Promise<Record<string, string>> => {
  const data = await getPriorities();
  return data.statuses;
};

const clearCache = (): void => {
  cachedPriorities = null;
};

export const priorityService = {
  getPriorities,
  getPrioritiesList,
  getStatusesList,
  clearCache,
};
