using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.DTOs;
using DuschnerConsulting.Domain.Entities;
using MediatR;

namespace DuschnerConsulting.Application.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthTicket?>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;

    public RegisterCommandHandler(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwt)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
    }

    public async Task<AuthTicket?> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existing = await _users.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existing is not null)
            return null;

        var userName = string.IsNullOrWhiteSpace(request.UserName)
            ? normalizedEmail.Split('@')[0]
            : request.UserName.Trim();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            UserName = userName,
            PasswordHash = _passwordHasher.Hash(request.Password),
        };

        await _users.AddAsync(user, cancellationToken);

        var (token, expiresIn) = _jwt.CreateAccessToken(user);
        return new AuthTicket(token, expiresIn, user.Id, user.Email);
    }
}
