/**
 * Shared HTTP client configuration.
 *
 * Responsibilities
 * - Create a single configured HTTP client (Axios/fetch wrapper) that points to the Symfony backend.
 * - Attach Authorization headers based on the currently stored access token.
 * - Handle automatic token refresh (call authService.refresh when a 401/SESSION_EXPIRED occurs).
 * - Normalize successful responses to `{ data, meta }` and throw an error object that mirrors backend RFC7807 payloads.
 * - Expose helpers for GET/POST/PATCH/DELETE with typed request/response generics.
 *
 * Reference Endpoints
 * - Base URL: `/api`
 * - Auth refresh: `POST /api/auth/refresh`
 *
 * Implementation Notes
 * - Read tokens from a storage helper (to be implemented later) rather than directly from localStorage to keep things testable.
 * - Consider exporting both the raw client instance and a lightweight request helper like `apiClient.request<T>(config)`.
 */
export {};
