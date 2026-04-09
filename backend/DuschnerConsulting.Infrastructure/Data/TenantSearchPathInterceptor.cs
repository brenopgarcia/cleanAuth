using System.Data.Common;
using DuschnerConsulting.Application.Abstractions;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DuschnerConsulting.Infrastructure.Data;

public sealed class TenantSearchPathInterceptor : DbConnectionInterceptor
{
    private readonly ITenantContext _tenant;

    public TenantSearchPathInterceptor(ITenantContext tenant) => _tenant = tenant;

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(_tenant.SchemaName))
        {
            await using var cmd = connection.CreateCommand();
            // Schema name is validated in middleware/admin targeting.
            cmd.CommandText = $"SET search_path TO \"{_tenant.SchemaName}\", public;";
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }

        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }
}

