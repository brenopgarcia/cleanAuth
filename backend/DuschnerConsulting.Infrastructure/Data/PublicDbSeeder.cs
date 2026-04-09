using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Infrastructure.Data;

public static class PublicDbSeeder
{
    public static async Task SeedDemoAdminAsync(PublicDbContext db, IPasswordHasher passwordHasher, CancellationToken cancellationToken = default)
    {
        if (await db.AdminUsers.AnyAsync(cancellationToken))
            return;

        db.AdminUsers.Add(new AdminUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            UserName = "admin",
            PasswordHash = passwordHasher.Hash("Admin123!"),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}

