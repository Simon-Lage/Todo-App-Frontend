/**
 * Project service reference.
 *
 * Supported Backend Routes
 * - `GET /api/project/list` with pagination + filters.
 * - `GET /api/project/{id}` for detail cards (includes description, createdBy, createdAt).
 * - `POST /api/project` create.
 * - `PATCH /api/project/{id}` edit core metadata.
 * - `DELETE /api/project/{id}` delete.
 * - `GET /api/project/{id}/tasks` to show scoped tasks.
 * - `GET /api/project/{id}/team` (if implemented) – otherwise build from tasks/assignments.
 *
 * Responsibilities
 * - Provide CRUD helpers returning typed project DTOs (matching `ProjectViewFactory` / `ProjectSummaryViewFactory`).
 * - Offer helper to fetch “project dashboard” data (e.g., stats, members) by aggregating API calls.
 * - Surface methods for linking/unlinking images via `imageService`.
 * - Ensure permission-aware fetches (pass `withPermissions` flag to include user perms when necessary).
 */
export {};
