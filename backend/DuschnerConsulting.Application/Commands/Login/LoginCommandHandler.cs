using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Cqrs;
using DuschnerConsulting.Application.DTOs;

namespace DuschnerConsulting.Application.Commands.Login;

public sealed class LoginCommandHandler : ICommandHandler<LoginCommand, AuthTicket?>
{
    /// <summary>BCrypt ("x", 11) — burns work on unknown-email path to reduce timing probes.</summary>
    private const string UnknownUserPasswordHash =
        "$2a$11$TdFQ3CW1rWG2AlUrj7G5suYL8Clp9woe8/cODA4Qgi75kl/5Kcrbu";

    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly ITenantContext _tenantContext;

    public LoginCommandHandler(
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

    public async Task<AuthTicket?> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var user = await _users.GetByEmailAsync(command.Email, cancellationToken);
        if (user is null)
        {
            _passwordHasher.Verify(command.Password, UnknownUserPasswordHash);
            return null;
        }

        if (!_passwordHasher.Verify(command.Password, user.PasswordHash))
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(_tenantContext.TenantSlug))
        {
            return null;
        }

        var (token, expiresIn) = _jwt.CreateAccessToken(user, _tenantContext.TenantSlug);
        return new AuthTicket(token, expiresIn, user.Id, user.Email);
    }
}
