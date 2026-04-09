using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DuschnerConsulting.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = DuschnerConsulting.Api.Auth.AuthPolicies.TenantRead)]
public class MeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Email);

        var role = User.FindFirstValue(AuthClaims.Role) ?? AuthClaims.RoleTenantUser;
        var perms = User.FindAll(AuthClaims.Permission).Select(c => c.Value).Distinct().ToArray();

        return Ok(new { userId, email, role, perms });
    }
}
