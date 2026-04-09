using System.Text.RegularExpressions;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Api.Tenancy;

public sealed class TenantResolutionMiddleware
{
    private static readonly Regex SafeSchema = new("^[a-z0-9_]+$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private readonly RequestDelegate _next;
    private readonly string[] _allowedHostSuffixes;
    private readonly IHostEnvironment _environment;

    public TenantResolutionMiddleware(RequestDelegate next, IConfiguration configuration, IHostEnvironment environment)
    {
        _next = next;
        _environment = environment;
        _allowedHostSuffixes = configuration
            .GetSection("TenantResolution:AllowedHostSuffixes")
            .Get<string[]>()
            ?.Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => s.Trim().ToLowerInvariant())
            .Distinct()
            .ToArray()
            ?? Array.Empty<string>();
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, PublicDbContext publicDb)
    {
        // Global admin endpoints will explicitly target a tenant (implemented later).
        // For now: resolve tenant from subdomain for all /api requests except /api/admin.
        if (!context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }
        if (context.Request.Path.StartsWithSegments("/api/admin", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }
        if (context.Request.Path.StartsWithSegments("/api/antiforgery", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var host = context.Request.Host.Host;
        if (!IsHostAllowed(host))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Host is not allowed for tenant resolution." });
            return;
        }

        var slug = ExtractSubdomainSlug(host);
        if (string.IsNullOrWhiteSpace(slug) && IsLocalDevelopmentHost(host))
        {
            // Local dev fallback: allow localhost without a tenant subdomain by selecting
            // the first active, non-expired tenant from the public catalog.
            var nowLocal = DateTimeOffset.UtcNow;
            var defaultTenant = await publicDb.Tenants
                .AsNoTracking()
                .Where(t => t.IsActive && t.ExpiresAt > nowLocal)
                .OrderBy(t => t.CreatedAt)
                .FirstOrDefaultAsync(context.RequestAborted);

            if (defaultTenant is not null && SafeSchema.IsMatch(defaultTenant.SchemaName))
            {
                tenantContext.SetTenant(defaultTenant.Slug, defaultTenant.SchemaName);
                await _next(context);
                return;
            }
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Tenant subdomain is required." });
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var tenant = await publicDb.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive && t.ExpiresAt > now, context.RequestAborted);

        if (tenant is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { message = "Unknown tenant." });
            return;
        }

        if (!SafeSchema.IsMatch(tenant.SchemaName))
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid tenant schema configuration." });
            return;
        }

        tenantContext.SetTenant(tenant.Slug, tenant.SchemaName);
        await _next(context);
    }

    private static string? ExtractSubdomainSlug(string host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return null;
        }

        // Supports: tenant.example.com, tenant.localhost
        // Rejects: localhost, 127.0.0.1
        if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }
        if (host.Equals("::1", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }
        if (host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var parts = host.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length < 2)
        {
            return null;
        }

        // tenant.localhost -> ["tenant","localhost"]
        // tenant.example.com -> ["tenant","example","com"]
        var slug = parts[0].ToLowerInvariant();
        return string.IsNullOrWhiteSpace(slug) ? null : slug;
    }

    private static bool IsLocalDevelopmentHost(string host)
    {
        return host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            || host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)
            || host.Equals("::1", StringComparison.OrdinalIgnoreCase);
    }

    private bool IsHostAllowed(string host)
    {
        if (_allowedHostSuffixes.Length == 0)
        {
            // Keep local development usable without additional setup.
            return _environment.IsDevelopment();
        }

        var normalizedHost = (host ?? string.Empty).Trim().ToLowerInvariant();
        foreach (var suffix in _allowedHostSuffixes)
        {
            if (normalizedHost.Equals(suffix, StringComparison.Ordinal)
                || normalizedHost.EndsWith("." + suffix, StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }
}

