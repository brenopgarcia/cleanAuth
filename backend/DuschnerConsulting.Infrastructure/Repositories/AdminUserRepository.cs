using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Domain.Entities;
using DuschnerConsulting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DuschnerConsulting.Infrastructure.Repositories;

public sealed class AdminUserRepository : IAdminUserRepository
{
    private readonly PublicDbContext _db;

    public AdminUserRepository(PublicDbContext db)
    {
        _db = db;
    }

    public Task<AdminUser?> GetActiveByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return _db.AdminUsers.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Email == normalized && a.IsActive, cancellationToken);
    }
}

