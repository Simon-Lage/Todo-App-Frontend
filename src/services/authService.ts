/**
 * Authentication service contract.
 *
 * Responsibilities
 * - `login(credentials)` → POST `/api/auth/login`, store tokens + user snapshot.
 * - `logout()` → POST `/api/auth/logout`, clear tokens, revoke refresh token.
 * - `refresh(refreshToken)` → POST `/api/auth/refresh`, return next token pair.
 * - `changePassword(payload)` → POST `/api/auth/change-password`.
 * - Password reset flow
 *   - `requestReset(email)` → POST `/api/auth/reset-password/confirm` (backend expects the info request first).
 *   - `verifyEmail(payload)` → intermediary step if the backend requires verification tokens.
 *   - `confirmReset(payload)` → POST `/api/auth/reset-password/confirm`.
 *
 * Needed Data
 * - DTOs mirror backend expectations (see `Project-Plan.md` info endpoints for required fields).
 * - Store both access and refresh tokens plus their expirations; expose a `getSession()` helper for guards/layouts.
 *
 * Error Handling
 * - Surface backend `code` values (`SESSION_EXPIRED`, `VALIDATION_ERROR`, …) so UI can show localized copy.
 */
export {};
