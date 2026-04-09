using DuschnerConsulting.Application.Abstractions;

namespace DuschnerConsulting.Api.Tenancy;

public sealed class TenantContext : ITenantContext
{
    public string? TenantSlug { get; private set; }
    public string? SchemaName { get; private set; }
    public bool IsTenantRequest { get; private set; }
    public bool IsGlobalAdminRequest { get; private set; }

    public void SetTenant(string tenantSlug, string schemaName)
    {
        TenantSlug = tenantSlug;
        SchemaName = schemaName;
        IsTenantRequest = true;
        IsGlobalAdminRequest = false;
    }

    public void SetGlobalAdminTarget(string tenantSlug, string schemaName)
    {
        TenantSlug = tenantSlug;
        SchemaName = schemaName;
        IsTenantRequest = false;
        IsGlobalAdminRequest = true;
    }
}

