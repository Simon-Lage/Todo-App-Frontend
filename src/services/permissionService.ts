/**
 * Permission service outline.
 *
 * API touchpoints
 * - `GET /api/permission/catalog` → returns `{ items: PermissionKey[], roles: string[] }`.
 * - `GET /api/user/permissions` → returns resolved boolean map for the authenticated user.
 *
 * Responsibilities
 * - Cache the catalog + assigned roles (needed for route guards and feature flags).
 * - Provide helper functions:
 *   - `has(permission: PermissionKey)` / `hasAll([...])` / `hasAny([...])`.
 *   - `resolve()` to expose the full permission map to components.
 *   - `getAssignedRoles()` for UI labels.
 * - Integrate with `apiClient` interceptors to update permission cache after login/logout.
 *
 * Implementation Guidance
 * - Keep the permission keys in sync with `PermissionRegistry::MAP` from the backend.
 * - Safely handle unknown permissions (throw or log) so misconfigurations are visible during dev.
 */
export {};
