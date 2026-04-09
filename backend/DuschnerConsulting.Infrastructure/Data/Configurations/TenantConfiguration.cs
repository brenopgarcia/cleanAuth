using DuschnerConsulting.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DuschnerConsulting.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants", "public");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Slug).HasMaxLength(63).IsRequired();
        builder.HasIndex(t => t.Slug).IsUnique();

        builder.Property(t => t.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(t => t.SchemaName).HasMaxLength(63).IsRequired();
        builder.HasIndex(t => t.SchemaName).IsUnique();

        builder.Property(t => t.IsActive).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.Property(t => t.ExpiresAt).IsRequired();
    }
}

