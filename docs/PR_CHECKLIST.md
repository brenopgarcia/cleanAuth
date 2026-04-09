# PR Checklist (Committed Files Review)

Use this checklist for every Pull Request review.  
Scope the review to committed files, but always evaluate security impact across backend and frontend.

## 1) Scope and intent

- [ ] PR title and description clearly explain **why** the change exists.
- [ ] Changed files match the stated scope (no accidental unrelated changes).
- [ ] Risky changes are called out (auth, tenancy, permissions, security, migrations).

## 2) Engineering guidelines compliance

- [ ] Clean Architecture boundaries are respected (Api/Application/Domain/Infrastructure).
- [ ] Backend validation uses FluentValidation where request rules exist.
- [ ] Frontend external data is validated with Zod schemas.
- [ ] Braces are used for all control flow statements (`if`, `else`, loops).
- [ ] Reuse existing utilities/hooks instead of duplicating logic.

## 3) Security review (mandatory on every PR)

### Backend attack surface

- [ ] Authn/Authz checks are correct for changed endpoints (no privilege escalation).
- [ ] Tenant isolation is preserved (no cross-tenant data access paths).
- [ ] Tenant resolution and tenant lifecycle rules are enforced (active + non-expired tenant).
- [ ] No sensitive data is returned in responses, logs, or exceptions.
- [ ] Input validation/sanitization exists for new or changed request models.
- [ ] SQL/command execution is safe (no untrusted interpolation in SQL/commands).
- [ ] Security-critical flows include replay/abuse protection where needed (tokens, reset flows, rate limits).

### Frontend attack surface

- [ ] No secrets/tokens/passwords are persisted in insecure browser storage.
- [ ] Authorization UI checks are capability-based and do not weaken backend policy.
- [ ] API errors shown to users are safe (no stack traces/internal details).
- [ ] CSRF/auth/session behaviors remain correct for changed requests.
- [ ] New links/HTML rendering avoid XSS vectors (no unsafe HTML injection).

## 4) Data and migrations

- [ ] DB schema changes include migration files and are backward-safe.
- [ ] Migration defaults are safe for existing data.
- [ ] Tenant/public schema changes are applied in the correct context.
- [ ] Data contracts are updated consistently across backend + frontend.

## 5) Tests and verification

- [ ] Backend builds successfully.
- [ ] Frontend builds successfully.
- [ ] Relevant tests are added/updated for changed behavior.
- [ ] Security-sensitive changes include regression tests when feasible.
- [ ] Manual test notes are provided for flows not covered by automation.

## 6) Operational and release checks

- [ ] Logging is actionable and does not leak sensitive data.
- [ ] Failure paths are explicit (safe errors, no silent security failures).
- [ ] Config changes are documented (env vars, host allowlists, auth settings).
- [ ] Docs are updated when behavior, security posture, or architecture changes.

## 7) Reviewer sign-off

- [ ] I reviewed all committed files and validated security impact.
- [ ] I checked backend and frontend vulnerability risks for this PR.
- [ ] I approve this PR for merge.

