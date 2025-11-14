/**
 * Image service description.
 *
 * Endpoints
 * - `POST /api/image` → multipart upload. Required fields: `file`, `type` (`project|task|user|...`), optional `project_id`, `task_id`, `user_id`.
 * - `GET /api/image/{id}` → download (returns BinaryFileResponse).
 * - `PATCH /api/image/{id}` → update metadata (type + associations).
 * - `DELETE /api/image/{id}` (if needed; verify backend support).
 *
 * Responsibilities
 * - Encapsulate multipart form handling (content-type, progress events).
 * - Provide convenience helpers (`uploadForTask(taskId, file)`, `uploadForProject(projectId, file)`).
 * - Handle access control errors (403) by surfacing friendly messages ("missing perm_can_assign_tasks_to_project").
 * - Integrate with `taskService` / `projectService` to keep image lists in sync after uploads/deletes.
 */
export {};
