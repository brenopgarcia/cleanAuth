using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Options;
using DuschnerConsulting.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DuschnerConsulting.Infrastructure.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private const string RoleClaim = "role";
    private const string PermissionClaim = "perm";
    private const string TenantSlugClaim = "tenant_slug";
    private const string RoleTenantUser = "tenant:user";
    private const string PermTenantRead = "tenant:read";
    private const string PermTenantWrite = "tenant:write";

    private readonly JwtSettings _jwt;

    public JwtTokenGenerator(IOptions<JwtSettings> jwt) => _jwt = jwt.Value;

    public (string Token, int ExpiresInSeconds) CreateAccessToken(User user, string tenantSlug)
    {
        var expiresInSeconds = _jwt.AccessTokenMinutes * 60;
        var expires = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

            // Default tenant user permissions (can be refined later).
            new Claim(RoleClaim, RoleTenantUser),
            new Claim(PermissionClaim, PermTenantRead),
            new Claim(PermissionClaim, PermTenantWrite),
            new Claim(TenantSlugClaim, tenantSlug),
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var handler = new JwtSecurityTokenHandler();
        return (handler.WriteToken(token), expiresInSeconds);
    }
}
