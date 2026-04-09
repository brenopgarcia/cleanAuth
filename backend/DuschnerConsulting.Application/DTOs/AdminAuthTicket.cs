namespace DuschnerConsulting.Application.DTOs;

public sealed record AdminAuthTicket(Guid AdminId, string Email, string UserName, string AccessToken, int ExpiresInSeconds);

