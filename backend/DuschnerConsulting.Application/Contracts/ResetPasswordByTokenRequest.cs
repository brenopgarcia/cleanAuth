namespace DuschnerConsulting.Application.Contracts;

public sealed record ResetPasswordByTokenRequest(string Token, string Password);

