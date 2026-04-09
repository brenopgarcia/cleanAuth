using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DuschnerConsulting.Infrastructure.Data;

internal static class DesignTimeConnectionStringResolver
{
    private const string FallbackConnectionString =
        "Host=localhost;Port=5432;Database=duschnerconsulting;Username=postgres;Password=Geheim1234";

    public static string Resolve()
    {
        var candidates = new[]
        {
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"),
            Environment.GetEnvironmentVariable("DEFAULT_CONNECTION"),
            Environment.GetEnvironmentVariable("DATABASE_URL")
        };

        foreach (var candidate in candidates)
        {
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                return candidate;
            }
        }

        return FallbackConnectionString;
    }
}

public sealed class PublicDbContextFactory : IDesignTimeDbContextFactory<PublicDbContext>
{
    public PublicDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<PublicDbContext>()
            .UseNpgsql(DesignTimeConnectionStringResolver.Resolve())
            .Options;

        return new PublicDbContext(options);
    }
}

public sealed class TenantDbContextFactory : IDesignTimeDbContextFactory<TenantDbContext>
{
    public TenantDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<TenantDbContext>()
            .UseNpgsql(DesignTimeConnectionStringResolver.Resolve())
            .Options;

        return new TenantDbContext(options);
    }
}
