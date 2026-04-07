# Project Haven – AI Coding Rules ([CLAUDE.md](http://CLAUDE.md))

This document defines comprehensive coding conventions, patterns, and requirements for AI coding assistants contributing to Project Haven. Follow every section precisely. Adhere strictly to the rules and examples below—this is a non-negotiable standards doc.

---

## Project Overview

Project Haven is a secure, full-stack case management web application supporting a Philippine nonprofit safehouse serving survivors of abuse and trafficking. Built as an INTEX academic project, it aims for production-grade security, usability, and code quality.

### Current Implementation Snapshot

The current repository uses `frontend/` and `backend/` as the top-level app folders. The public home page, impact dashboard, privacy policy, and cookie-consent flow are implemented, and the public impact dashboard reads from the connected Azure SQL database.

The application supports three user types:

- **Unauthenticated visitors:** can access general information and impact data.
- **Authenticated donors:** can view and manage their own contributions and see anonymized dashboard data.
- **Authenticated admins:** can manage residents, case records, visitation logs, and full reporting.

### Repository Structure

- `/frontend`: React + TypeScript + Vite frontend application.
- `/frontend/src/components/`: Shared and feature components.
- `/frontend/src/pages/`: Route/page components.
- `/frontend/src/styles/`: Page-scoped CSS modules.
- `/frontend/src/lib/`: Small client-side utilities.
- `/backend`: ASP.NET Core (.NET 10) backend API.
- `/backend/Controllers/`: API controllers.
- `/backend/Data/`: EF Core DbContext and migrations.
- `/backend/Models/`: Entity models and DTOs.
- `/backend/Services/`: Data seeding and bootstrap services.

### Project Status

- **Maturity:** MVP with production intentions.
- **Key technologies:** .NET 10, C#, React 18, TypeScript (strict), Vite, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Recharts, React Router v6, Entity Framework Core, cookie-based auth, Azure SQL Database.
- **Key technologies:** .NET 10, C#, React 18, TypeScript (strict), Vite, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Recharts, React Router v6, Entity Framework Core, cookie-based auth, Azure SQL Database.
- **Monorepo:** Yes – `/client` and `/server` as two first-level directories.

---

## Tech Stack & Conventions

- **Framework (backend):** ASP.NET Core (.NET 10)
  - Controller-based routing only; do not use minimal API endpoints.
- **Language (backend):** C# (nullable reference types enabled; use record types for DTOs).
- **Language (frontend):** TypeScript (strict mode; no `any`).
- **Package managers:** `npm` (frontend), `dotnet CLI` (backend).
- **Database:** Azure SQL Database through Entity Framework Core.
  - Use only EF Core migrations for schema changes; never modify the database manually.
- **ORM:** Entity Framework Core.
  - Use only async methods (e.g., `ToListAsync`, `FirstOrDefaultAsync`); never use synchronous database access.
- **Authentication:** Cookie-based sessions for the current MVP. Do not use JWT tokens.
  - Roles: "Admin," "Donor," and unauthenticated user.
- **Hosting:** Microsoft Azure (Azure App Service).
- **UI:** shadcn/ui (as base for all interactive elements) + Tailwind CSS (utility extension; never use inline styles).
- **State management:** React Query (TanStack Query) for all server state; React Hook Form for form state. Do not use Redux, Zustand, or other global stores.
- **Charting:** Recharts for all data visualization.
- **Routing:** React Router v6. All protected/admin/donor routes use wrapper components for auth checks.
- **Forms:** React Hook Form + Zod for all forms; every form must be validated via a Zod schema.

---

## Code Style Rules

### Naming Conventions

- **Files (React components):** PascalCase (`ResidentProfile.tsx`)
- **Files (non-components):** kebab-case (`use-auth.ts`, `api-client.ts`)
- **Directories:** kebab-case (`caseload-inventory/`, `process-recordings/`)
- **Variables & functions:** camelCase
- **Types & interfaces:** PascalCase (`ResidentDto`, `SupporterType`)
- **C# classes & methods:** PascalCase
- **C# private fields:** `_camelCase` (underscore prefix)
- **Database tables:** snake_case (e.g., `process_recordings`, `home_visitations`)
- **Database fields:** camelCase (as per entity model)
  - **Example:** `firstName`, `lastName`, `dateOfAdmission`

### Imports & Exports

- **Import order (frontend):**
  1. React (if used)
  2. Third-party libraries (e.g., `react-query`, `axios`)
  3. Local imports

  Leave a blank line between each group.

- **Exports:**
  - Prefer named exports for all non-page components and utilities.
  - Page-level components (in `/pages/`) may use default export.
  - Do not mix default and named exports in the same file.

### TypeScript

- Always use strict mode (`strict: true`).
- **Never use** `any`**.** Use `unknown` if absolutely necessary, but prefer precise typing.
- Explicitly declare return types on all exported functions, hooks, and utilities.
- All form data and API responses must be runtime-validated with Zod schemas.
- Prefer `interface` for object shapes; use `type` for unions and primitives.

### Formatting

- Use Prettier with the default config.
- ESLint is required; do not disable rules via inline comments unless absolutely necessary and with justification.
- C# follows standard .NET formatting: Allman braces style, 4-space indentation.

---

## Component & Architecture Patterns

### Component Structure

- All React components must be functional components using hooks only; do not use React class components.
- Organize feature components under `/client/src/components/[feature]/`.
- Page components live in `/client/src/pages/`.
- Shared/reusable components (modal, table, button) go in `/client/src/components/ui/`.
- For any component with more than 2 props, define a named `Props` interface immediately above the component.
  - _Example:_

    ```
    interface ResidentCardProps {
      resident: ResidentDto;
      onSelect: (id: string) => void;
    }
    ```

```

### Data Fetching

* **React Query** is mandatory for all data-fetching and mutations.
* Never use `useEffect` for data-fetching.
* All server requests must go through `/client/src/lib/api-client.ts`.
* Handle both loading and error states explicitly in every useQuery/useMutation instance.
* Do not access data fields before confirming `!isLoading && !isError`.

### State Management

* **Server state:** React Query only.
* **Form state:** React Hook Form only; never use uncontrolled form state.
* **Global client state:** Do not use Redux, Zustand, or similar; use React context sparingly for auth/session only.

### API Routes (Backend)

* Place all controllers in `/server/Controllers/`.
* Every controller:
  * `[ApiController]` and `[Route("api/[controller]")]` attributes.
  * All methods must be async, returning `Task<IActionResult>` or `Task<ActionResult<T>>`, with `async/await`.
* Input validation:
  * **Frontend:** All API requests must validate data with Zod schema before sending.
  * **Backend:** DTOs require model validation attributes.
* Error responses must always be `{ error: string, details?: string }`.
* All controllers require `[Authorize]` except `AuthController`.
  * `[Authorize(Roles = "Admin")]` for any CUD operations.
  * `[AllowAnonymous]` only on explicitly public endpoints.

---

## Do's and Don'ts

### Do

* **Do** use React Query for all server state (list, single, create, update, delete).
* **Do** validate all form inputs with Zod (frontend) and model validation (backend).
* **Do** apply `[Authorize]` to every controller by default—opt out with `[AllowAnonymous]` only as needed.
* **Do** show a shadcn/ui AlertDialog/modal confirmation before any delete API call (IS414 requirement).
* **Do** use only `async/await` for EF Core DB calls (no synchronous methods).
* **Do** store all secrets in `.env` (frontend) or Azure App Service env variables (backend)—never hardcode credentials or commit them.
* **Do** implement pagination on all list/table views using `page` and `pageSize` query params.
* **Do** show loading skeletons or spinners for all async states (check `isLoading`).
* **Do** use shadcn/ui as the base for every form, dialog, button, and table.
* **Do** set a page title and favicon on every route.
* **Do** sanitize string inputs on the backend before database insert.
* **Do** restrict all `notes_restricted` fields to `Admin` only responses—never include them for donors or unauthenticated users.
* **Do** use separate request/response DTOs—never expose EF Core entity models.
* **Do** create unit tests for every non-trivial hook, utility, and backend service.

### Don't

* **Don't** use `any` type ever.
* **Don't** use `useEffect` for data fetching—use React Query hooks.
* **Don't** use inline styles—use Tailwind CSS classes.
* **Don't** place business logic in React components—move to `/client/src/lib/` or backend services.
* **Don't** install new dependencies (npm, NuGet) without explicit approval.
* **Don't** expose PII (personally identifiable info) in public endpoints/pages; public responses should be anonymized.
* **Don't** return EF Core entity models in API responses; map to DTOs.
* **Don't** use synchronous EF Core methods (`ToList`, `FirstOrDefault`); always use async variants.
* **Don't** commit `.env`, `appsettings.Development.json` with real credentials, or any secrets to GitHub.
* **Don't** skip error handling—every API call must handle error states in the frontend and backend.
* **Don't** use minimal API endpoints or Pages Router; stick to controller routing and React Router v6.

---

## Testing & Quality

### Testing Framework

* **Backend (unit/integration):** xUnit
* **Frontend:** Vitest + React Testing Library.
* **Test file naming:** Place `*.test.ts` or `*.test.tsx` files adjacent to the source files they cover.
* **E2E:** Not required for this project.

### What to Test

* **Backend:** All service-layer methods; all API controllers (happy and error paths); all authorization checks (unauth, donor, admin).
* **Frontend:** Zod schemas, custom hooks using React Query, conditional rendering logic in non-trivial components.
* **Do not** duplicate trivial tests; focus on logic, security, and edge cases.

### Quality Gates

* ESLint must pass with **zero errors** prior to commit.
* Prettier formatting required; run before all pushes.
* TypeScript must build cleanly (`tsc --noEmit`).
* C# backend must compile with no warnings treated as errors.
* Lighthouse accessibility score must be ≥90% for every page at both 375px (mobile) and 1280px (desktop).
* All destructive (delete) actions must trigger an explicit confirmation modal.

---

## Common Pitfalls

* **Pitfall:** Accidentally exposing EF Core entities from API controllers.
  * **Correct approach:** Always map to DTOs (`ResidentResponseDto`, `SupporterDto`, etc.) before returning.
* **Pitfall:** Using `useEffect` for data fetching in React.
  * **Correct approach:** Use React Query’s `useQuery`/`useMutation`.
* **Pitfall:** Hardcoding secrets or connection strings.
  * **Correct approach:** Use Azure App Service env vars (backend) and `.env` (frontend, gitignored). For local test secrets, use `dotnet user-secrets`.
* **Pitfall:** Missing `[Authorize]` on new endpoints.
  * **Correct approach:** Apply `[Authorize]` at the controller class level by default. Remove only with `[AllowAnonymous]` for logins/public data. The auth flow currently uses cookie sessions and a seeded admin account bootstrap.
* **Pitfall:** Skipping the IS414-required delete confirmation modal.
  * **Correct approach:** Every destructive UI flow must use shadcn/ui's `AlertDialog` before API call.
* **Pitfall:** Returning `notes_restricted` for non-admins.
  * **Correct approach:** Create separate response DTOs; exclude restricted fields for all non-admins.
* **Pitfall:** CSP header blocking static resources.
  * **Correct approach:** Configure CSP via .NET middleware. Test in browser to ensure React app (and Vite dev server) works. Permit only necessary sources.
* **Pitfall:** Cookie consent banner is cosmetic only.
  * **Correct approach:** GDPR banner must actually set an accessible cookie and block non-essential cookies until user opts in.
* **Pitfall:** Using synchronous EF Core calls in controllers/services.
  * **Correct approach:** Use `ToListAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()` exclusively for DB access.
* **Pitfall:** Using `roles.FirstOrDefault()` to get a user's primary role — order is not guaranteed when a user has multiple roles.
  * **Correct approach:** Use `ResolvePrimaryRole()` in `AuthController` which explicitly prioritizes Admin > Donor > other. Always resolve role by priority, never by DB order.

---

## Security Rules

These are graded IS414 requirements—violations will result in project rejection.

* **HTTPS:** The app must be served over SSL with a valid TLS certificate. HTTP requests must redirect to HTTPS (enforced via Azure App Service and/or .NET middleware).
* **Password Policy:** If and when ASP.NET Identity is introduced, configure `PasswordOptions` stricter than Microsoft’s default—use the policy provided in IS414 lectures, not from Microsoft docs. For the current MVP, keep the seeded admin password policy documented in the README.
* **RBAC:** Enforce three roles:
  * **Admin:** Full CRUD on all resources.
  * **Donor:** Read-only access to donation history and impact dashboard.
  * **Unauthenticated:** Homepage, impact dashboard, privacy policy, login.
  * API endpoint authorization must precisely enforce this.
* **CSP Header:** Set the Content-Security-Policy header with only required sources, in .NET middleware (not via meta tag). Graders will check via dev tools.
* **Credentials:** Never store secrets in source code or repo. Use Azure App Service env variables for backend; `.env` (gitignored) for frontend.
* **Privacy Policy:** A GDPR-compliant privacy policy tailored to Project Haven must be linked from every public page's footer.
* **Cookie Consent:** Implement a functional GDPR cookie consent banner. Must set a real browser (non-HttpOnly) cookie; block all non-essential cookies pre-consent.
* **Additional (P1):**
  * If adding OAuth: Integrate via ASP.NET Identity external providers.
  * If adding HSTS: Enable via `UseHsts()` in .NET only if Azure App Service tier allows; test before submission.
  * If adding dark mode: Store user preference in browser cookie accessible by React on load.

---

**Always** read this AI Coding Rules file before any code generation, refactoring, or review for Project Haven. Violations or inconsistencies must be flagged and remediated before code is merged.
```
