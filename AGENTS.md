The Backend is under ../Todo-App-Backend

Infos über das Backend: http://localhost:8443/api/doc.json

# Frontend Guidelines

## Project Structure & Tech Stack
This is a **React 19** application built with **Ionic 8** and **Vite**, using **TypeScript**.
- **Routing**: `react-router` v5 (via `@ionic/react-router`). Centralized configuration in `src/routes.ts`, handled by `src/routing/AppRoutes.tsx` which implements Role-Based Access Control (RBAC).
- **State Management**: Custom service-based architecture.
  - Auth state is managed by `src/services/sessionStore.ts` (localStorage wrapper) and exposed via `src/routing/useAuthSession.tsx`.
  - API interactions are encapsulated in `src/services/`.
- **Mobile**: **Capacitor 7** for native deployment.
- **UI**: Ionic Components (`@ionic/react`) + standard CSS/Modules.

### Key Directories
- `src/pages/`: Feature-based organization (e.g., `App/Account`, `App/Admin`).
- `src/services/`: API clients and business logic (e.g., `authService.ts`, `taskService.ts`).
- `src/components/`: Shared UI components.
- `src/routing/`: Route guards and layout handling.
- `cypress/`: End-to-End tests.

## Build, Test, and Development
- **Install**: `npm install`
- **Start Dev**: `npm run dev` (Vite)
- **Build**: `npm run build` (TypeScript + Vite)
- **Test (Unit)**: `npm run test.unit` (Vitest)
- **Test (E2E)**: `npm run test.e2e` (Cypress)
- **Lint**: `npm run lint` (ESLint)

## Coding Style & Conventions
- **Components**: Functional components with Hooks.
- **Naming**: PascalCase for components/pages, camelCase for functions/hooks/vars.
- **Routing**: define routes in `src/routes.ts`. Do not use `Route` components directly in JSX unless necessary; prefer the config-driven approach to ensure protection rules are applied.
- **API**: Use the provided services in `src/services/` which use a configured `apiClient`. Do not make raw `fetch` calls in components.

## Architecture Notes
- **Authentication**: JWT-based. Tokens are stored in localStorage via `sessionStore`.
- **Protection Rules**: Routes can define `protectionRules` (e.g., `hasToBeAuthenticated`, `userRolesRequired`) which are enforced by `AppRoutes.tsx`.


Text im Frontend soll einfach hardcoded Deutsch sein.