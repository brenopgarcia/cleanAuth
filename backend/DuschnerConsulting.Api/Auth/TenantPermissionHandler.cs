using DuschnerConsulting.Application.Abstractions;
using Microsoft.AspNetCore.Authorization;

namespace DuschnerConsulting.Api.Auth;

public sealed class TenantPermissionHandler : AuthorizationHandler<TenantPermissionRequirement>
{
    private readonly ITenantContext _tenant;

    public TenantPermissionHandler(ITenantContext tenant) => _tenant = tenant;

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TenantPermissionRequirement requirement)
    {
        if (string.IsNullOrWhiteSpace(_tenant.SchemaName))
        {
            return Task.CompletedTask;
        }

        var isAdmin = context.User.Claims.Any(c =>
            c.Type == AuthClaims.Role && string.Equals(c.Value, AuthClaims.RoleAdmin, StringComparison.Ordinal));

        if (isAdmin)
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        if (!_tenant.IsTenantRequest)
        {
            return Task.CompletedTask;
        }

        var tokenTenantSlug = context.User.FindFirst(c => c.Type == AuthClaims.TenantSlug)?.Value;
        if (!string.Equals(tokenTenantSlug, _tenant.TenantSlug, StringComparison.Ordinal))
        {
            return Task.CompletedTask;
        }

        var hasPermission = context.User.Claims.Any(c =>
            c.Type == AuthClaims.Permission && string.Equals(c.Value, requirement.Permission, StringComparison.Ordinal));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

