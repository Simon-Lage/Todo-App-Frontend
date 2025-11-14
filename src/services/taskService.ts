/**
 * Task service scaffolding.
 *
 * Endpoints to wrap
 * - `GET /api/task/list` (supports filters: project_id, assigned_to_user_id, created_by_user_id, status, priority, due_date range).
 * - `GET /api/task/{id}` for detail view incl. project + assignees.
 * - `POST /api/task` create new task.
 * - `PATCH /api/task/{id}` update core fields.
 * - `DELETE /api/task/{id}` remove task.
 * - Workflow helpers:
 *   - `POST /api/task/{id}/assign-user`
 *   - `POST /api/task/{id}/unassign-user`
 *   - `POST /api/task/{id}/move-to-project`
 *   - `POST /api/task/{id}/status`
 *
 * Implementation Guidance
 * - Accept typed filter objects and map them to the backend’s expected query parameters.
 * - Return normalized DTOs containing `TaskSummaryViewFactory`/`TaskViewFactory` fields (see backend for shapes).
 * - Provide convenience methods for “my tasks” vs “all tasks” to keep components lean.
 * - Coordinate with `imageService` for `/api/image` uploads linked to tasks.
 */
export {};
