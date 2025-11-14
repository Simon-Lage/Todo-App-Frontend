/**
 * Log service spec.
 *
 * Backend Endpoints
 * - `GET /api/logs/list` → accepts filters: action, performed_by_user_id, from, to, q.
 * - `GET /api/logs/{id}` → detail view.
 * - `GET /api/logs/stats` → summary numbers + last retention run timestamp.
 *
 * Responsibilities
 * - Provide param builders for date ranges and action filters (convert UI Date objects to ISO strings).
 * - Keep list responses typed (e.g., `AuditLogEntry` interface matching `LogViewFactory` output).
 * - Offer helper to export logs (CSV/JSON) by reusing the list endpoint without pagination limit.
 * - Surface retention metadata for the admin dashboard (calls `stats()`).
 */
export {};
