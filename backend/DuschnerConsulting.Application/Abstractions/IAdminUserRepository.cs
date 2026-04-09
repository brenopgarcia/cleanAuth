using DuschnerConsulting.Domain.Entities;

namespace DuschnerConsulting.Application.Abstractions;

public interface IAdminUserRepository
{
    Task<AdminUser?> GetActiveByEmailAsync(string email, CancellationToken cancellationToken = default);
}

