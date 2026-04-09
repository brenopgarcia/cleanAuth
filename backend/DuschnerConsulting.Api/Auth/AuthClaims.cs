namespace DuschnerConsulting.Api.Auth;

public static class AuthClaims
{
    public const string Role = "role";
    public const string Permission = "perm";
    public const string TenantSlug = "tenant_slug";

    public const string RoleAdmin = "admin";
    public const string RoleTenantUser = "tenant:user";

    public const string PermTenantRead = "tenant:read";
    public const string PermTenantWrite = "tenant:write";
}

