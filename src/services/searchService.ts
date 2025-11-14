/**
 * Search service blueprint.
 *
 * Supported Endpoints
 * - `GET /api/search/{term}` → aggregated search across users/projects/tasks/logs.
 * - `GET /api/search/user/{term}` → user-only.
 * - `GET /api/search/project/{term}`
 * - `GET /api/search/task/{term}`
 * - `GET /api/search/logs/{term}`
 * - `POST /api/search` → complex search with structured payload (term, limit, filters per entity).
 *
 * Responsibilities
 * - Normalize filters (convert UI filter chips into backend field names, e.g., `dueDateFrom` → `due_date_from`).
 * - Apply permission-aware defaults (e.g., if user lacks `perm_can_read_all_tasks`, include `restrict_to_self=true`).
 * - Provide throttled/debounced helpers so UI can call `searchService.quick(term)` without manual timer logic.
 * - Return typed result buckets: `{ users?: UserSummary[]; projects?: ProjectSummary[]; tasks?: TaskSummary[]; logs?: LogEntry[] }`.
 */
export {};
