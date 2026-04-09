using System.Text.RegularExpressions;
using DuschnerConsulting.Application.Contracts;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Infrastructure.Data;
using DuschnerConsulting.Api.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/admin/tenants")]
[Authorize(Policy = DuschnerConsulting.Api.Auth.AuthPolicies.Admin)]
public class AdminTenantsController : ControllerBase
{
    private static readonly Regex SafeSlug = new("^[a-z0-9-]{1,63}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private static readonly Regex SafeSchema = new("^[a-z0-9_]+$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly PublicDbContext _publicDb;
    private readonly TenantDbContext _tenantDb;
    private readonly ITenantContext _tenantContext;
    private readonly IValidator<CreateTenantRequest> _createValidator;

    public AdminTenantsController(
        PublicDbContext publicDb,
        TenantDbContext tenantDb,
        ITenantContext tenantContext,
        IValidator<CreateTenantRequest> createValidator)
    {
        _publicDb = publicDb;
        _tenantDb = tenantDb;
        _tenantContext = tenantContext;
        _createValidator = createValidator;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var tenants = await _publicDb.Tenants.AsNoTracking()
            .OrderBy(t => t.Slug)
            .Select(t => new { t.Id, t.Slug, t.DisplayName, t.SchemaName, t.IsActive, t.CreatedAt, t.ExpiresAt, t.DisabledAt })
            .ToListAsync(cancellationToken);

        return Ok(tenants);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var validation = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        var slug = (request.Slug ?? string.Empty).Trim().ToLowerInvariant();
        var displayName = (request.DisplayName ?? string.Empty).Trim();
        var expiresAt = request.ExpiresAt;

        // Re-check normalized slug to protect schema derivation after trim/lower normalization.
        if (!SafeSlug.IsMatch(slug))
        {
            return BadRequest(new { message = "Invalid slug. Use lowercase letters, digits and '-' (max 63)." });
        }

        var schemaName = $"tenant_{slug.Replace('-', '_')}";
        if (!SafeSchema.IsMatch(schemaName))
        {
            return BadRequest(new { message = "Derived schema name is invalid." });
        }

        var exists = await _publicDb.Tenants.AnyAsync(t => t.Slug == slug || t.SchemaName == schemaName, cancellationToken);
        if (exists)
        {
            return Conflict(new { message = "Tenant already exists." });
        }

        var now = DateTimeOffset.UtcNow;
        var tenant = new DuschnerConsulting.Domain.Entities.Tenant
        {
            Id = Guid.NewGuid(),
            Slug = slug,
            DisplayName = displayName,
            SchemaName = schemaName,
            IsActive = true,
            CreatedAt = now,
            ExpiresAt = expiresAt,
        };

        _publicDb.Tenants.Add(tenant);
        await _publicDb.SaveChangesAsync(cancellationToken);

        // Provision tenant schema and apply tenant migrations (users, refresh_tokens, etc.)
        await _publicDb.Database.ExecuteSqlAsync(
            $"CREATE SCHEMA IF NOT EXISTS \"{tenant.SchemaName}\";",
            cancellationToken);

        _tenantContext.SetGlobalAdminTarget(tenant.Slug, tenant.SchemaName);
        await _tenantDb.Database.MigrateAsync(cancellationToken);

        return Ok(new
        {
            tenant.Id,
            tenant.Slug,
            tenant.DisplayName,
            tenant.SchemaName,
            tenant.IsActive,
            tenant.CreatedAt,
            tenant.ExpiresAt,
            tenant.DisabledAt
        });
    }
}

