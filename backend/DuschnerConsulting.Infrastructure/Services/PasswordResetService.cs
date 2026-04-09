using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Options;
using DuschnerConsulting.Domain.Entities;
using DuschnerConsulting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DuschnerConsulting.Infrastructure.Services;

public sealed class PasswordResetService : IPasswordResetService
{
    private const string TokenTypeClaim = "typ";
    private const string TenantSlugClaim = "tenant_slug";
    private const string UserIdClaim = "uid";
    private const string ResetTokenType = "pwd_reset";
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(30);

    private readonly JwtSettings _jwt;
    private readonly TenantDbContext _tenantDb;
    private readonly IPasswordHasher _passwordHasher;

    public PasswordResetService(
        IOptions<JwtSettings> jwt,
        TenantDbContext tenantDb,
        IPasswordHasher passwordHasher)
    {
        _jwt = jwt.Value;
        _tenantDb = tenantDb;
        _passwordHasher = passwordHasher;
    }

    public async Task<(string Token, DateTimeOffset ExpiresAt)> CreateTokenAsync(
        Guid userId,
        string tenantSlug,
        CancellationToken cancellationToken = default)
    {
        var expiresAt = DateTimeOffset.UtcNow.Add(TokenLifetime);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var jti = Guid.NewGuid().ToString("N");
        var claims = new[]
        {
            new Claim(TokenTypeClaim, ResetTokenType),
            new Claim(UserIdClaim, userId.ToString()),
            new Claim(TenantSlugClaim, tenantSlug),
            new Claim(JwtRegisteredClaimNames.Jti, jti),
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: expiresAt.UtcDateTime,
            signingCredentials: creds);

        _tenantDb.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Jti = jti,
            ExpiresAt = expiresAt,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await _tenantDb.SaveChangesAsync(cancellationToken);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public async Task<bool> ConsumeAsync(string token, string newPassword, string expectedTenantSlug, CancellationToken cancellationToken = default)
    {
        var principal = ValidateToken(token);
        if (principal is null)
        {
            return false;
        }

        var typ = principal.FindFirst(TokenTypeClaim)?.Value;
        var tokenTenant = principal.FindFirst(TenantSlugClaim)?.Value;
        var userIdRaw = principal.FindFirst(UserIdClaim)?.Value;
        var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (!string.Equals(typ, ResetTokenType, StringComparison.Ordinal)
            || !string.Equals(tokenTenant, expectedTenantSlug, StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(jti)
            || !Guid.TryParse(userIdRaw, out var userId))
        {
            return false;
        }

        var now = DateTimeOffset.UtcNow;
        var consumedRows = await _tenantDb.PasswordResetTokens
            .Where(t => t.Jti == jti
                && t.UserId == userId
                && t.UsedAt == null
                && t.ExpiresAt > now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.UsedAt, now), cancellationToken);
        if (consumedRows == 0)
        {
            return false;
        }

        var user = await _tenantDb.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.PasswordHash = _passwordHasher.Hash(newPassword);
        await _tenantDb.SaveChangesAsync(cancellationToken);
        return true;
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwt.Issuer,
                ValidAudience = _jwt.Audience,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.FromMinutes(1),
            }, out _);
        }
        catch
        {
            return null;
        }
    }
}

