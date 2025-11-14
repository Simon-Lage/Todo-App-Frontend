/**
 * User service documentation.
 *
 * Core Endpoints
 * - `GET /api/user` → fetch current user profile (used on dashboard/account area).
 * - `GET /api/user/list` → admin listing with pagination/filter params.
 * - `POST /api/user` → admin create user (payload defined in `/api/info/user`).
 * - `PATCH /api/user/{id}` → admin update user (fields depend on info endpoint).
 * - `PATCH /api/user` → self update route (`SelfUpdateUserRequest`).
 * - `POST /api/user/{id}/deactivate` / `reactivate`
 * - `POST /api/user/reset-password` (self) + `/verify-email-for-password-reset`
 * - `GET /api/user/{id}/tasks` & `/projects` for dashboards.
 *
 * Responsibilities
 * - Provide typed methods for each of the above.
 * - Accept filter objects (`{ q?: string; active?: boolean; roleId?: string; }`) and translate them to query parameters.
 * - Reuse `permissionService` results to avoid unnecessary `/permissions` fetches where possible.
 * - Expose helper selectors for UI (e.g., `mapToListItem(user)` for tables).
 *
 * Data Requirements
 * - Reference backend DTO definitions located in `Todo-App-Backend/src/User/Dto`.
 * - Expect UUID strings for all identifiers.
 */
export {};
