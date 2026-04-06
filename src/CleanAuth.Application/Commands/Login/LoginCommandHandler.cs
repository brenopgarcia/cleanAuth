using CleanAuth.Application.Abstractions;
using CleanAuth.Application.DTOs;
using MediatR;

namespace CleanAuth.Application.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthTicket?>
{
    /// <summary>BCrypt ("x", 11) — burns work on unknown-email path to reduce timing probes.</summary>
    private const string UnknownUserPasswordHash =
        "$2a$11$TdFQ3CW1rWG2AlUrj7G5suYL8Clp9woe8/cODA4Qgi75kl/5Kcrbu";

    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwt;

    public LoginCommandHandler(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwt)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
    }

    public async Task<AuthTicket?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            _passwordHasher.Verify(request.Password, UnknownUserPasswordHash);
            return null;
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return null;

        var (token, expiresIn) = _jwt.CreateAccessToken(user);
        return new AuthTicket(token, expiresIn, user.Id, user.Email);
    }
}
