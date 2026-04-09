## Multi-Tenancy (Implementation Notes)

This file tracks the agreed approach and current implementation status.

See also:
- `docs/ENGINEERING_GUIDELINES.md` (tenant safety rules, clean boundaries, review checklist)

### Goals
- **Schema-per-tenant** data isolation on PostgreSQL
- Tenant resolved from **subdomain** (e.g. `tenant1.example.com`)
- **Tenant-scoped users** (a user belongs to exactly one tenant)
- **Global admin** (role-based, same app) can operate across tenants by selecting a target tenant

### Current status
- **Backend**: on **.NET 9** + EF Core + PostgreSQL (Npgsql)
- **Application architecture**: minimal CQRS (project-owned dispatcher/handlers), no external mediator package
- **DbContexts**:
  - **`PublicDbContext`**: global tables in `public` schema (`tenants`, `admin_users`)
  - **`TenantDbContext`**: tenant-owned tables (`users`, `refresh_tokens`) via `search_path`
- **Tenant lifecycle**:
  - `tenants` includes mandatory expiration (`expires_at`)
  - middleware resolves only active + non-expired tenants
- **Migrations**:
  - `backend/DuschnerConsulting.Infrastructure/Migrations/Public/*`
  - `backend/DuschnerConsulting.Infrastructure/Migrations/Tenant/*`
- **Tenant resolution**:
  - Middleware resolves tenant for `/api/*` from subdomain
  - `/api/admin/*` is excluded (admin endpoints target tenants explicitly)
- **Schema selection**:
  - `TenantSearchPathInterceptor` runs `SET search_path TO "<tenantSchema>", public;` for `TenantDbContext`

### Implemented files (high signal)
- **Tenant middleware/context**
  - `backend/DuschnerConsulting.Application/Abstractions/ITenantContext.cs`
  - `backend/DuschnerConsulting.Api/Tenancy/TenantContext.cs`
  - `backend/DuschnerConsulting.Api/Tenancy/TenantResolutionMiddleware.cs`
- **Per-request search_path**
  - `backend/DuschnerConsulting.Infrastructure/Data/TenantSearchPathInterceptor.cs`
- **DbContexts**
  - `backend/DuschnerConsulting.Infrastructure/Data/PublicDbContext.cs`
  - `backend/DuschnerConsulting.Infrastructure/Data/TenantDbContext.cs`
- **Admin tenants API**
  - `backend/DuschnerConsulting.Api/Controllers/AdminTenantsController.cs`
  - `backend/DuschnerConsulting.Api/Controllers/AdminTenantUsersController.cs`
  - `backend/DuschnerConsulting.Api/Controllers/AdminAuthController.cs`
  - `backend/DuschnerConsulting.Api/Auth/*` (policies + handler)
  - `frontend/src/hooks/useAccess.ts`

### EF Core migrations (two DbContexts)
- Order matters on a fresh database:
  - run `PublicDbContext` update first (creates `public.tenants`)
  - then run `TenantDbContext` update
- Use explicit context and output path:
  - `PublicDbContext` migrations go to `backend/DuschnerConsulting.Infrastructure/Migrations/Public`
  - `TenantDbContext` migrations go to `backend/DuschnerConsulting.Infrastructure/Migrations/Tenant`
- Recommended commands (from repo root):
  - `dotnet ef migrations add <Name> --project backend/DuschnerConsulting.Infrastructure/DuschnerConsulting.Infrastructure.csproj --startup-project backend/DuschnerConsulting.Api/DuschnerConsulting.Api.csproj --context PublicDbContext --output-dir Migrations/Public`
  - `dotnet ef migrations add <Name> --project backend/DuschnerConsulting.Infrastructure/DuschnerConsulting.Infrastructure.csproj --startup-project backend/DuschnerConsulting.Api/DuschnerConsulting.Api.csproj --context TenantDbContext --output-dir Migrations/Tenant`
  - `dotnet ef database update --project backend/DuschnerConsulting.Infrastructure/DuschnerConsulting.Infrastructure.csproj --startup-project backend/DuschnerConsulting.Api/DuschnerConsulting.Api.csproj --context PublicDbContext`
  - `dotnet ef database update --project backend/DuschnerConsulting.Infrastructure/DuschnerConsulting.Infrastructure.csproj --startup-project backend/DuschnerConsulting.Api/DuschnerConsulting.Api.csproj --context TenantDbContext`
- Design-time context creation is provided by:
  - `backend/DuschnerConsulting.Infrastructure/Data/DesignTimeDbContextFactories.cs`
- Design-time connection string resolution order:
  - `ConnectionStrings__DefaultConnection`
  - `DEFAULT_CONNECTION`
  - `DATABASE_URL`
  - fallback local dev connection string

### Next steps
- **Tenant provisioning**
  - Done for `POST /api/admin/tenants` (schema creation + tenant migrations)
- **Global admin**
  - Done for `login/me/logout` + tenant/user CRUD (**including reset-password**)
- **Frontend**
  - Continue hardening tests and UX polish for admin operations
  - Add tenant expiry edit/renew workflow for existing tenants (currently set at creation time)

