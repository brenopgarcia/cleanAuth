using Microsoft.AspNetCore.Authorization;

namespace DuschnerConsulting.Api.Auth;

public sealed class TenantPermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public TenantPermissionRequirement(string permission) => Permission = permission;
}

