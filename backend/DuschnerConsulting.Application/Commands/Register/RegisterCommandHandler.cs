using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Cqrs;
using DuschnerConsulting.Application.DTOs;
using DuschnerConsulting.Domain.Entities;

namespace DuschnerConsulting.Application.Commands.Register;

public sealed class RegisterCommandHandler : ICommandHandler<RegisterCommand, AuthTicket?>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly ITenantContext _tenantContext;

    public RegisterCommandHandler(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwt,
        ITenantContext tenantContext)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _tenantContext = tenantContext;
    }

    public async Task<AuthTicket?> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var normalizedEmail = command.Email.Trim().ToLowerInvariant();

        var existing = await _users.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existing is not null)
        {
            return null;
        }

        var userName = string.IsNullOrWhiteSpace(command.UserName)
            ? normalizedEmail.Split('@')[0]
            : command.UserName.Trim();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            UserName = userName,
            PasswordHash = _passwordHasher.Hash(command.Password),
        };

        await _users.AddAsync(user, cancellationToken);

        if (string.IsNullOrWhiteSpace(_tenantContext.TenantSlug))
        {
            return null;
        }

        var (token, expiresIn) = _jwt.CreateAccessToken(user, _tenantContext.TenantSlug);
        return new AuthTicket(token, expiresIn, user.Id, user.Email);
    }
}
