using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.DTOs;

namespace DuschnerConsulting.Application.Services;

public sealed class AdminAuthService : IAdminAuthService
{
    /// <summary>BCrypt ("x", 11) — burns work on unknown-email path to reduce timing probes.</summary>
    private const string UnknownAdminPasswordHash =
        "$2a$11$TdFQ3CW1rWG2AlUrj7G5suYL8Clp9woe8/cODA4Qgi75kl/5Kcrbu";

    private readonly IAdminUserRepository _adminUsers;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAdminJwtTokenGenerator _jwt;

    public AdminAuthService(
        IAdminUserRepository adminUsers,
        IPasswordHasher passwordHasher,
        IAdminJwtTokenGenerator jwt)
    {
        _adminUsers = adminUsers;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
    }

    public async Task<AdminAuthTicket?> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = (email ?? string.Empty).Trim().ToLowerInvariant();
        var admin = await _adminUsers.GetActiveByEmailAsync(normalizedEmail, cancellationToken);
        if (admin is null)
        {
            _passwordHasher.Verify(password, UnknownAdminPasswordHash);
            return null;
        }

        if (!_passwordHasher.Verify(password, admin.PasswordHash))
        {
            return null;
        }

        var (token, expiresInSeconds) = _jwt.CreateAdminAccessToken(admin);
        return new AdminAuthTicket(admin.Id, admin.Email, admin.UserName, token, expiresInSeconds);
    }
}

