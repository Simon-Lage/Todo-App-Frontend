export type TaskStatus = 'open' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_by_user_id: string;
  assigned_user_ids: string[];
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type TaskSummaryView = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  assigned_user_ids: string[];
};

export type ProjectView = {
  id: string;
  name: string;
  description: string | null;
  created_by_user_id: string;
  created_at: string;
};

export type ProjectSummaryView = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type UserView = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  is_password_temporary: boolean;
  created_at: string;
  temporary_password_created_at: string | null;
  last_login_at: string | null;
  profile_image_id?: string | null;
};

export type UserListView = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export type RoleView = {
  id: string;
  name: string;
  [key: string]: boolean | string;
};

export type ImageView = {
  id: string;
  type: string;
  original_filename: string;
  size: number;
  mime_type: string;
  created_by_user_id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string | null;
  created_at: string;
};

export type LogView = {
  id: string;
  event: string;
  actor_user_id: string | null;
  context: Record<string, unknown>;
  created_at: string;
};

export type PermissionKey = string;

export type PermissionMap = Record<PermissionKey, boolean>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  sort_by: string;
  direction: 'ASC' | 'DESC';
};

export type SingleResponse<T> = {
  data: T;
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: string;
  assigned_to_user_id?: string;
  created_by_user_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  q?: string;
};

export type ProjectFilters = {
  q?: string;
  created_by_user_id?: string;
};

export type UserFilters = {
  q?: string;
  active?: boolean;
  role_id?: string;
};

export type PaginationParams = {
  offset?: number;
  limit?: number;
  sort_by?: string;
  direction?: 'asc' | 'desc';
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  project_id: string;
  assigned_user_ids?: string[];
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  active?: boolean;
  roles?: string[];
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  active?: boolean;
  roles?: string[];
};

export type SelfUpdateUserPayload = {
  name?: string;
};

export type CreateRolePayload = {
  name: string;
  permissions: Record<PermissionKey, boolean>;
};

export type UpdateRolePayload = {
  name?: string;
  permissions?: Record<PermissionKey, boolean>;
};

export type SearchResult = {
  type: 'task' | 'project' | 'user';
  id: string;
  title: string;
  description?: string;
  relevance?: number;
};

