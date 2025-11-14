/**
 * Role service expectations.
 *
 * Backend Coverage
 * - `GET /api/role/list` → returns paginated `RoleView` objects (id, name, permissions map).
 * - `GET /api/role/{id}`
 * - `POST /api/role` (payload defined via `/api/info/role` create endpoint: `name`, `permissions` map).
 * - `PATCH /api/role/{id}` (name optional, partial permissions map).
 * - `DELETE /api/role/{id}`
 * - `GET /api/role/by-user/{userId}` to show a user’s current role assignments.
 * - `PATCH /api/role/by-user/{userId}` assign roles (array of role IDs).
 *
 * Responsibilities
 * - Provide typed methods for each API call.
 * - Keep permission maps strongly typed (e.g., `Record<PermissionKey, boolean>`).
 * - Offer helper functions to transform role DTOs into table/list friendly data (name + permission badges).
 * - Integrate with `permissionService` so new role definitions immediately influence route guards.
 */
export {};
