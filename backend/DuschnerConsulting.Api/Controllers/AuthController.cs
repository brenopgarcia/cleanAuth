using DuschnerConsulting.Api.Auth;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Commands.Login;
using DuschnerConsulting.Application.Commands.Register;
using DuschnerConsulting.Application.Cqrs;
using DuschnerConsulting.Application.Contracts;
using DuschnerConsulting.Application.DTOs;
using FluentValidation;
using DuschnerConsulting.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ICommandDispatcher _commands;
    private readonly IRefreshTokenService _refreshTokens;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<ResetPasswordByTokenRequest> _resetPasswordByTokenValidator;

    public AuthController(
        ICommandDispatcher commands,
        IRefreshTokenService refreshTokens,
        IPasswordResetService passwordResetService,
        IValidator<LoginRequest> loginValidator,
        IValidator<RegisterRequest> registerValidator,
        IValidator<ResetPasswordByTokenRequest> resetPasswordByTokenValidator)
    {
        _commands = commands;
        _refreshTokens = refreshTokens;
        _passwordResetService = passwordResetService;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
        _resetPasswordByTokenValidator = resetPasswordByTokenValidator;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        var result = await _commands.Send<LoginCommand, AuthTicket?>(
            new LoginCommand(request.Email, request.Password),
            cancellationToken);
        if (result is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

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
        var validation = await _registerValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        var result = await _commands.Send<RegisterCommand, AuthTicket?>(
            new RegisterCommand(request.Email, request.Password, request.UserName),
            cancellationToken);

        if (result is null)
        {
            return Conflict(new { message = "Unable to register with the provided information." });
        }

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

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> ResetPasswordByToken(
        [FromBody] ResetPasswordByTokenRequest request,
        [FromServices] ITenantContext tenantContext,
        CancellationToken cancellationToken)
    {
        var validation = await _resetPasswordByTokenValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        if (string.IsNullOrWhiteSpace(tenantContext.TenantSlug))
        {
            return BadRequest(new { message = "Tenant context is required." });
        }

        var ok = await _passwordResetService.ConsumeAsync(
            request.Token,
            request.Password,
            tenantContext.TenantSlug,
            cancellationToken);
        if (!ok)
        {
            return BadRequest(new { message = "Invalid or expired reset token." });
        }

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
