using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

namespace DuschnerConsulting.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AntiforgeryController : ControllerBase
{
    [HttpGet("token")]
    [IgnoreAntiforgeryToken]
    public IActionResult GetToken([FromServices] IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { token = tokens.RequestToken });
    }
}
