using DuschnerConsulting.Application.DTOs;

namespace DuschnerConsulting.Application.Abstractions;

public abstract record RefreshRotationResult;

public record RefreshRotationOk(
    AuthTicket Session,
    string NewRefreshPlaintext,
    int RefreshMaxAgeSeconds) : RefreshRotationResult;

public record RefreshRotationInvalid : RefreshRotationResult;

/// <summary>Rotated token presented again — all refresh tokens for that user were revoked.</summary>
public record RefreshRotationReuseDetected : RefreshRotationResult;

public interface IRefreshTokenService
{
    Task<(string Plaintext, int MaxAgeSeconds)> CreateForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<RefreshRotationResult> RotateAsync(
        string? refreshPlaintext,
        CancellationToken cancellationToken = default);

    Task RevokeByPlaintextAsync(
        string? refreshPlaintext,
        CancellationToken cancellationToken = default);

    Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
