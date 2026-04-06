using System.Security.Cryptography;
using System.Text;
using CleanAuth.Application.Abstractions;
using CleanAuth.Application.DTOs;
using CleanAuth.Application.Options;
using CleanAuth.Domain.Entities;
using CleanAuth.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CleanAuth.Infrastructure.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly IUserRepository _users;
    private readonly IJwtTokenGenerator _jwtGen;
    private readonly IOptions<JwtSettings> _jwt;

    public RefreshTokenService(
        AppDbContext db,
        IUserRepository users,
        IJwtTokenGenerator jwtGen,
        IOptions<JwtSettings> jwt)
    {
        _db = db;
        _users = users;
        _jwtGen = jwtGen;
        _jwt = jwt;
    }

    public async Task<(string Plaintext, int MaxAgeSeconds)> CreateForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var plaintext = NewPlaintext();
        var now = DateTimeOffset.UtcNow;
        var expires = now.AddDays(_jwt.Value.RefreshTokenDays);
        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = Hash(plaintext),
            ExpiresAt = expires,
            CreatedAt = now,
        };
        _db.RefreshTokens.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        var maxAge = (int)Math.Max(1, (expires - now).TotalSeconds);
        return (plaintext, maxAge);
    }

    public async Task<RefreshRotationResult> RotateAsync(
        string? refreshPlaintext,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshPlaintext))
            return new RefreshRotationInvalid();

        var hash = Hash(refreshPlaintext.Trim());
        var row = await _db.RefreshTokens.FirstOrDefaultAsync(
            t => t.TokenHash == hash,
            cancellationToken);

        if (row is null)
            return new RefreshRotationInvalid();

        if (row.RevokedAt.HasValue || row.ReplacedByTokenId.HasValue)
        {
            await RevokeAllForUserAsync(row.UserId, cancellationToken);
            return new RefreshRotationReuseDetected();
        }

        if (row.ExpiresAt < DateTimeOffset.UtcNow)
            return new RefreshRotationInvalid();

        var user = await _users.GetByIdAsync(row.UserId, cancellationToken);
        if (user is null)
            return new RefreshRotationInvalid();

        var (accessToken, accessExpiresSec) = _jwtGen.CreateAccessToken(user);

        var now = DateTimeOffset.UtcNow;
        var newExpires = now.AddDays(_jwt.Value.RefreshTokenDays);
        var newPlain = NewPlaintext();
        var newRow = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = row.UserId,
            TokenHash = Hash(newPlain),
            ExpiresAt = newExpires,
            CreatedAt = now,
        };

        row.RevokedAt = now;
        row.ReplacedByTokenId = newRow.Id;
        _db.RefreshTokens.Add(newRow);
        await _db.SaveChangesAsync(cancellationToken);

        var ticket = new AuthTicket(accessToken, accessExpiresSec, user.Id, user.Email);
        var refreshMaxAge = (int)Math.Max(1, (newExpires - now).TotalSeconds);
        return new RefreshRotationOk(ticket, newPlain, refreshMaxAge);
    }

    public async Task RevokeByPlaintextAsync(
        string? refreshPlaintext,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshPlaintext))
            return;

        var hash = Hash(refreshPlaintext.Trim());
        var row = await _db.RefreshTokens.FirstOrDefaultAsync(
            t => t.TokenHash == hash,
            cancellationToken);
        if (row is null || row.RevokedAt.HasValue)
            return;

        row.RevokedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(
                s => s.SetProperty(t => t.RevokedAt, now),
                cancellationToken);
    }

    private static string NewPlaintext() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    private static string Hash(string plaintext)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plaintext));
        return Convert.ToHexString(bytes);
    }
}
