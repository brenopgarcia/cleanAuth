namespace DuschnerConsulting.Application.Contracts;

public sealed record CreateTenantRequest(string Slug, string DisplayName, DateTimeOffset ExpiresAt);

public sealed record CreateTenantUserRequest(string Email, string UserName, string Password);

