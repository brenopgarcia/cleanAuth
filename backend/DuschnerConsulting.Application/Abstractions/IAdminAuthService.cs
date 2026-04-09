using DuschnerConsulting.Application.DTOs;

namespace DuschnerConsulting.Application.Abstractions;

public interface IAdminAuthService
{
    Task<AdminAuthTicket?> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
}

