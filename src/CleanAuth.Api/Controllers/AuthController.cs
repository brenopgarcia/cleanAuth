using CleanAuth.Api.Auth;
using CleanAuth.Application.Abstractions;
using CleanAuth.Application.Commands.Login;
using CleanAuth.Application.Commands.Register;
using CleanAuth.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CleanAuth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IRefreshTokenService _refreshTokens;

    public AuthController(ISender mediator, IRefreshTokenService refreshTokens)
    {
        _mediator = mediator;
        _refreshTokens = refreshTokens;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password), cancellationToken);
        if (result is null)
            return Unauthorized(new { message = "Invalid email or password." });

        await AppendSessionCookiesAsync(result, cancellationToken);
        return Ok(ToSession(result));
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<LoginResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _mediator.Send(
            new RegisterCommand(request.Email, request.Password, request.UserName),
            cancellationToken);

        if (result is null)
            return Conflict(new { message = "Unable to register with the provided information." });

        await AppendSessionCookiesAsync(result, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToSession(result));
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<LoginResponse>> Refresh(CancellationToken cancellationToken)
    {
        var plaintext = Request.Cookies[AuthCookieNames.RefreshToken];
        var outcome = await _refreshTokens.RotateAsync(plaintext, cancellationToken);

        switch (outcome)
        {
            case RefreshRotationOk ok:
                AccessTokenCookie.Append(Response, Request, ok.Session.AccessToken, ok.Session.ExpiresIn);
                RefreshTokenCookie.Append(Response, Request, ok.NewRefreshPlaintext, ok.RefreshMaxAgeSeconds);
                return Ok(ToSession(ok.Session));

            case RefreshRotationReuseDetected:
                ClearSessionCookies();
                return Unauthorized(new { message = "Session invalidated for security. Please sign in again." });

            default:
                ClearSessionCookies();
                return Unauthorized(new { message = "Session expired. Please sign in again." });
        }
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var plaintext = Request.Cookies[AuthCookieNames.RefreshToken];
        await _refreshTokens.RevokeByPlaintextAsync(plaintext, cancellationToken);
        ClearSessionCookies();
        return NoContent();
    }

    private async Task AppendSessionCookiesAsync(AuthTicket ticket, CancellationToken cancellationToken)
    {
        AccessTokenCookie.Append(Response, Request, ticket.AccessToken, ticket.ExpiresIn);
        var (plain, maxAge) = await _refreshTokens.CreateForUserAsync(ticket.UserId, cancellationToken);
        RefreshTokenCookie.Append(Response, Request, plain, maxAge);
    }

    private void ClearSessionCookies()
    {
        AccessTokenCookie.Delete(Response);
        RefreshTokenCookie.Delete(Response);
    }

    private static LoginResponse ToSession(AuthTicket ticket) =>
        new()
        {
            ExpiresIn = ticket.ExpiresIn,
            UserId = ticket.UserId,
            Email = ticket.Email,
        };
}
