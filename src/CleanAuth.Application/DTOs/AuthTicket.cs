namespace CleanAuth.Application.DTOs;

/// <summary>
/// Internal auth result: <see cref="AccessToken"/> is set only for issuing an HttpOnly cookie at the API boundary.
/// </summary>
public sealed record AuthTicket(string AccessToken, int ExpiresIn, Guid UserId, string Email);
