using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Options;
using DuschnerConsulting.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DuschnerConsulting.Infrastructure.Services;

public sealed class AdminJwtTokenGenerator : IAdminJwtTokenGenerator
{
    private const string RoleClaim = "role";
    private const string RoleAdmin = "admin";

    private readonly JwtSettings _jwt;

    public AdminJwtTokenGenerator(IOptions<JwtSettings> jwt) => _jwt = jwt.Value;

    public (string Token, int ExpiresInSeconds) CreateAdminAccessToken(AdminUser admin)
    {
        var expiresInSeconds = _jwt.AccessTokenMinutes * 60;
        var expires = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, admin.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, admin.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(RoleClaim, RoleAdmin),
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

