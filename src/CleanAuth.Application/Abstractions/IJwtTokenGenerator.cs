using CleanAuth.Domain.Entities;

namespace CleanAuth.Application.Abstractions;

public interface IJwtTokenGenerator
{
    (string Token, int ExpiresInSeconds) CreateAccessToken(User user);
}
