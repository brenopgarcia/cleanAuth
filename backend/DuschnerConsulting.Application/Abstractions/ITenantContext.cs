namespace DuschnerConsulting.Application.Abstractions;

public interface ITenantContext
{
    string? TenantSlug { get; }
    string? SchemaName { get; }
    bool IsTenantRequest { get; }
    bool IsGlobalAdminRequest { get; }
    void SetTenant(string tenantSlug, string schemaName);
    void SetGlobalAdminTarget(string tenantSlug, string schemaName);
}

