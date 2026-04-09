using System.Text.RegularExpressions;
using DuschnerConsulting.Application.Contracts;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Domain.Entities;
using DuschnerConsulting.Infrastructure.Data;
using DuschnerConsulting.Api.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/admin/tenants/{tenantSlug}/users")]
[Authorize(Policy = DuschnerConsulting.Api.Auth.AuthPolicies.Admin)]
public class AdminTenantUsersController : ControllerBase
{
    private static readonly Regex SafeSlug = new("^[a-z0-9-]{1,63}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private static readonly Regex SafeSchema = new("^[a-z0-9_]+$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly PublicDbContext _publicDb;
    private readonly TenantDbContext _tenantDb;
    private readonly ITenantContext _tenantContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IValidator<CreateTenantUserRequest> _createUserValidator;
    private readonly string? _publicAppBaseUrl;

    public AdminTenantUsersController(
        PublicDbContext publicDb,
        TenantDbContext tenantDb,
        ITenantContext tenantContext,
        IPasswordHasher passwordHasher,
        IPasswordResetService passwordResetService,
        IConfiguration configuration,
        IValidator<CreateTenantUserRequest> createUserValidator)
    {
        _publicDb = publicDb;
        _tenantDb = tenantDb;
        _tenantContext = tenantContext;
        _passwordHasher = passwordHasher;
        _passwordResetService = passwordResetService;
        _publicAppBaseUrl = configuration["PublicApp:BaseUrl"];
        _createUserValidator = createUserValidator;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromRoute] string tenantSlug, CancellationToken cancellationToken)
    {
        var tenant = await ResolveTenantAsync(tenantSlug, cancellationToken);
        if (tenant is null)
        {
            return NotFound(new { message = "Unknown tenant." });
        }

        _tenantContext.SetGlobalAdminTarget(tenant.Slug, tenant.SchemaName);

        var users = await _tenantDb.Users.AsNoTracking()
            .OrderBy(u => u.Email)
            .Select(u => new { u.Id, u.Email, u.UserName })
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromRoute] string tenantSlug, [FromBody] CreateTenantUserRequest request, CancellationToken cancellationToken)
    {
        var validation = await _createUserValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        var tenant = await ResolveTenantAsync(tenantSlug, cancellationToken);
        if (tenant is null)
        {
            return NotFound(new { message = "Unknown tenant." });
        }

        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var userName = (request.UserName ?? string.Empty).Trim();
        var password = request.Password ?? string.Empty;

        // model validation handles email/username/password checks

        _tenantContext.SetGlobalAdminTarget(tenant.Slug, tenant.SchemaName);

        var exists = await _tenantDb.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
        {
            return Conflict(new { message = "User already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = userName,
            PasswordHash = _passwordHasher.Hash(password),
        };

        _tenantDb.Users.Add(user);
        await _tenantDb.SaveChangesAsync(cancellationToken);

        return Ok(new { user.Id, user.Email, user.UserName });
    }

    [HttpPost("{userId:guid}/reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromRoute] string tenantSlug,
        [FromRoute] Guid userId,
        CancellationToken cancellationToken)
    {
        var tenant = await ResolveTenantAsync(tenantSlug, cancellationToken);
        if (tenant is null)
        {
            return NotFound(new { message = "Unknown tenant." });
        }

        _tenantContext.SetGlobalAdminTarget(tenant.Slug, tenant.SchemaName);

        var user = await _tenantDb.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return NotFound(new { message = "Unknown user." });
        }

        var (resetToken, expiresAt) = await _passwordResetService.CreateTokenAsync(user.Id, tenant.Slug, cancellationToken);
        var resetUrl = BuildResetUrl(resetToken);
        if (resetUrl is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Reset URL base is not configured." });
        }

        return Ok(new { userId = user.Id, resetToken, resetUrl, expiresAt });
    }

    private async Task<DuschnerConsulting.Domain.Entities.Tenant?> ResolveTenantAsync(string tenantSlug, CancellationToken cancellationToken)
    {
        var slug = (tenantSlug ?? string.Empty).Trim().ToLowerInvariant();
        if (!SafeSlug.IsMatch(slug))
        {
            return null;
        }

        var schemaName = $"tenant_{slug.Replace('-', '_')}";
        if (!SafeSchema.IsMatch(schemaName))
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        return await _publicDb.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug && t.SchemaName == schemaName && t.IsActive && t.ExpiresAt > now, cancellationToken);
    }

    private string? BuildResetUrl(string resetToken)
    {
        var configuredBaseUrl = (_publicAppBaseUrl ?? string.Empty).Trim();
        if (!Uri.TryCreate(configuredBaseUrl, UriKind.Absolute, out var baseUri))
        {
            return null;
        }

        var builder = new UriBuilder(baseUri)
        {
            Path = "/reset-password",
            Query = $"token={Uri.EscapeDataString(resetToken)}",
        };
        return builder.Uri.ToString();
    }
}

