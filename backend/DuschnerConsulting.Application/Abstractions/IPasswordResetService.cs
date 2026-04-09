namespace DuschnerConsulting.Application.Abstractions;

public interface IPasswordResetService
{
    Task<(string Token, DateTimeOffset ExpiresAt)> CreateTokenAsync(Guid userId, string tenantSlug, CancellationToken cancellationToken = default);
    Task<bool> ConsumeAsync(string token, string newPassword, string expectedTenantSlug, CancellationToken cancellationToken = default);
}

