using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DuschnerConsulting.Api.Auth;
using DuschnerConsulting.Application.Contracts;
using DuschnerConsulting.Api.Validation;
using DuschnerConsulting.Application.Abstractions;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{
    private readonly IAdminAuthService _adminAuthService;
    private readonly IValidator<AdminLoginRequest> _loginValidator;

    public AdminAuthController(
        IAdminAuthService adminAuthService,
        IValidator<AdminLoginRequest> loginValidator)
    {
        _adminAuthService = adminAuthService;
        _loginValidator = loginValidator;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Login([FromBody] AdminLoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToDictionary());
        }

        var ticket = await _adminAuthService.LoginAsync(request.Email, request.Password, cancellationToken);
        if (ticket is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        AccessTokenCookie.Append(Response, Request, ticket.AccessToken, ticket.ExpiresInSeconds);

        return Ok(new
        {
            adminId = ticket.AdminId,
            ticket.Email,
            ticket.UserName,
            expiresIn = ticket.ExpiresInSeconds,
        });
    }

    [HttpGet("me")]
    [Authorize(Policy = AuthPolicies.Admin)]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Email);
        var role = User.FindFirstValue(AuthClaims.Role) ?? AuthClaims.RoleAdmin;

        return Ok(new { adminId = userId, email, role });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public IActionResult Logout()
    {
        AccessTokenCookie.Delete(Response);
        RefreshTokenCookie.Delete(Response);
        return NoContent();
    }
}

