# Engineering Guidelines (SOLID, Clean Architecture, React)

This document is the shared implementation reference for the project. The goal is to keep code consistent, testable, and easy to extend while we continue implementing multi-tenancy features.

## 1) General principles

- **Prefer boring solutions**: pick the simplest approach that fits the constraints.
- **Make the right thing easy**: centralize cross-cutting concerns (auth, tenancy, parsing/formatting, API calls).
- **Keep boundaries explicit**: don’t “leak” infrastructure into business logic.
- **Small, safe steps**: refactor by extraction and tests/verification (build) after changes.

## 1.1) Coding conventions (project-wide)

- **Always use braces** for control flow statements on backend and frontend:
  - `if` / `else if` / `else`
  - `for` / `while` / `do`
  - `foreach`
  - even for single-line bodies (prevents “foot-guns” during refactors)

## 2) SOLID (practical rules)

- **S — Single Responsibility**: a module/class/function should have one reason to change.
  - If a React component has a lot of conditional logic + formatting + API calls, extract helpers/hooks.
  - If a controller does parsing + authorization + orchestration + persistence, extract service(s) in Application/Infrastructure as appropriate.
- **O — Open/Closed**: extend behavior via configuration or new types rather than editing many call sites.
  - Example: dashboard table column config; don’t duplicate table implementations.
- **L — Liskov Substitution**: keep interface contracts consistent; avoid “special cases” that break consumers.
- **I — Interface Segregation**: smaller interfaces are easier to mock and evolve.
  - Example: separate `IAdminJwtTokenGenerator` from tenant `IJwtTokenGenerator`.
- **D — Dependency Inversion**: Application/Domain depend on abstractions; Infrastructure provides implementations.

## 3) Clean Architecture conventions (backend)

### Dependency direction (must)
- **Api** → **Application** → **Domain**
- **Infrastructure** → **Application** and **Domain**
- **Domain** must not reference anything else.

### Validation standard (backend)
- **We always use FluentValidation** for backend validation.
  - Prefer validators in the **Application** layer for application DTOs/use-cases.
  - Validators for API-only request contracts can live in the **Api** layer.
  - Controllers should stay thin; validate inputs via the application pipeline or explicit validator calls (but do not duplicate rules).
  - Reject invalid requests early with clear error messages.

### What belongs where
- **Domain**
  - Entities, value objects, domain rules.
  - No EF Core attributes, no HttpContext, no configuration.
- **Application**
  - Use cases, authorization decisions (policy names), DTOs, interfaces/abstractions.
  - CQRS uses project-owned abstractions (`ICommand`, `ICommandHandler`, `ICommandDispatcher`) without external mediator packages.
  - Orchestration logic (what happens), but not how persistence works.
- **Infrastructure**
  - EF Core contexts/configurations, repositories, token generators, hashing implementations, external IO.
- **Api**
  - HTTP concerns: controllers, middleware, authentication setup, request/response shaping.

### Multi-tenancy rules (backend)
- **Never accept a schema name from the client**.
  - Client can send only **tenant slug** (admin targeting). Server derives schema safely.
- **TenantDbContext must rely on `search_path`**.
  - No hard-coded schema mappings for tenant tables.
- **Admin endpoints target tenants explicitly**.
  - Admin endpoints should not rely on subdomain resolution.
- **Tenant expiry is mandatory**.
  - Every tenant must have an `ExpiresAt` value.
  - Tenant access/authentication must be denied when `ExpiresAt <= now (UTC)`.
  - Tenant creation/update inputs that set expiry must be validated with FluentValidation.
- **Authorization**
  - `role=admin` implies **all tenant permissions** by default (read/write) for UI and API.

### Data access rules
- Prefer **single responsibility queries** and explicit projections (`Select`) for API responses.
- Use `AsNoTracking()` for read-only endpoints.
- Avoid leaking EF entities directly to the frontend; return shaped DTO/anonymous objects.

## 4) React + TypeScript best practices (frontend)

### Component design
- Keep components **small** and focused on rendering.
- Prefer **pure formatting helpers** (e.g. `formatEuro`, `getStandzeitToneClass`) in `src/lib/`.
- Prefer **hooks** for cross-cutting UI logic (e.g. `useAccess`) instead of prop-drilling.

### Testing standard (frontend)
- **We always use Vitest** for frontend tests.
  - Unit test pure helpers in `src/lib/*`.
  - Test hooks and components where the logic is non-trivial (especially auth/access control).
  - Prefer small, deterministic tests over large end-to-end style tests inside the frontend project.

### State management
- **Zustand** holds cross-page/session state (auth, theme).
- Keep derived values computed via `useMemo` or selectors rather than storing duplicates.

### Networking & validation
- All API calls go through the shared axios client (`src/lib/api.ts`).
- Validate external data with **Zod** schemas (`src/schemas/*`).
- Handle auth edge cases:
  - Tenant session: `/api/me`
  - Admin session: `/api/admin/auth/me`

### Routing
- Routes should be explicit and guarded at the page level.
- Prefer redirecting unauthorized users to the correct login page (e.g. `/admin-login`).

### UI access control
- UI checks should be **capability-based** (can read/write) rather than sprinkling `role === 'admin'` everywhere.
- `useAccess()` is the canonical source for UI decisions.

## 5) “Code review” checklist (quick)

- **Boundaries**: does the change keep Api/Application/Domain/Infrastructure separation?
- **Tenant safety**: are we deriving schema on the server and validating slug?
- **Tenant lifecycle**: does the flow enforce tenant expiration in auth/tenant resolution paths?
- **Admin defaults**: does admin automatically get read/write in UI and backend policies?
- **Validation**: did we validate external data (request payloads / API responses)?
- **Duplication**: did we extract repeated logic (formatting, parsing, tone classes)?
- **Build**: does `dotnet build` + frontend build succeed?

