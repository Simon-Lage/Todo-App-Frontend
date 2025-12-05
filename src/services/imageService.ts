import { sessionStore } from './sessionStore';
import type { ImageView, SingleResponse } from '../types/api';

const API_BASE = '/api';

type UploadParams = {
  file: File;
  type: string;
  userId?: string;
  projectId?: string;
  taskId?: string;
};

type UpdateImagePayload = {
  type?: string;
  user_id?: string;
  project_id?: string;
  task_id?: string;
};

const upload = async (params: UploadParams): Promise<ImageView> => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('type', params.type);

  if (params.userId) formData.append('user_id', params.userId);
  if (params.projectId) formData.append('project_id', params.projectId);
  if (params.taskId) formData.append('task_id', params.taskId);

  const session = sessionStore.read();
  const accessToken = session?.tokens?.access_token;

  const response = await fetch(`${API_BASE}/image`, {
    method: 'POST',
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }

  const result = (await response.json()) as SingleResponse<ImageView>;
  return result.data;
};

const uploadForTask = async (taskId: string, file: File, type = 'task'): Promise<ImageView> => {
  return upload({ file, type, taskId });
};

const uploadForProject = async (projectId: string, file: File, type = 'project'): Promise<ImageView> => {
  return upload({ file, type, projectId });
};

const uploadForUser = async (userId: string, file: File, type = 'user'): Promise<ImageView> => {
  return upload({ file, type, userId });
};

const getDownloadUrl = (imageId: string): string => {
  return `${API_BASE}/image/${imageId}`;
};

const list = async (filter: { userId?: string; projectId?: string; taskId?: string }): Promise<ImageView[]> => {
  const params = new URLSearchParams();
  if (filter.userId) params.append('user_id', filter.userId);
  if (filter.projectId) params.append('project_id', filter.projectId);
  if (filter.taskId) params.append('task_id', filter.taskId);

  const session = sessionStore.read();
  const accessToken = session?.tokens?.access_token;

  const response = await fetch(`${API_BASE}/image/list?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Image list failed with status ${response.status}`);
  }

  const result = (await response.json()) as SingleResponse<{ items: ImageView[]; total: number }>;
  return result.data.items;
};
};

const update = async (imageId: string, payload: UpdateImagePayload): Promise<ImageView> => {
  const session = sessionStore.read();
  const accessToken = session?.tokens?.access_token;

  const response = await fetch(`${API_BASE}/image/${imageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Image update failed with status ${response.status}`);
  }

  const result = (await response.json()) as SingleResponse<ImageView>;
  return result.data;
};

const deleteImage = async (imageId: string): Promise<void> => {
  const session = sessionStore.read();
  const accessToken = session?.tokens?.access_token;

  const response = await fetch(`${API_BASE}/image/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Image delete failed with status ${response.status}`);
  }
};

export const imageService = {
  upload,
  uploadForTask,
  uploadForProject,
  uploadForUser,
  getDownloadUrl,
  list,
  update,
  delete: deleteImage,
};
