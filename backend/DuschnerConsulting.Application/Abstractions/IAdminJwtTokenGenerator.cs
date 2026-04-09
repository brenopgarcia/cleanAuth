using DuschnerConsulting.Domain.Entities;

namespace DuschnerConsulting.Application.Abstractions;

public interface IAdminJwtTokenGenerator
{
    (string Token, int ExpiresInSeconds) CreateAdminAccessToken(AdminUser admin);
}

