using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedDemoUserAsync(TenantDbContext db, IPasswordHasher passwordHasher, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
            return;

        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "demo@example.com",
            UserName = "demo",
            PasswordHash = passwordHasher.Hash("Demo123!")
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}
