using DuschnerConsulting.Domain.Entities;

namespace DuschnerConsulting.Application.Abstractions;

public interface IJwtTokenGenerator
{
    (string Token, int ExpiresInSeconds) CreateAccessToken(User user);
}
