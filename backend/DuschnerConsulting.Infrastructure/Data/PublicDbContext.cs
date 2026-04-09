using DuschnerConsulting.Domain.Entities;
using DuschnerConsulting.Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Infrastructure.Data;

public class PublicDbContext : DbContext
{
    public PublicDbContext(DbContextOptions<PublicDbContext> options)
        : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new TenantConfiguration());
        modelBuilder.ApplyConfiguration(new AdminUserConfiguration());
    }
}

