namespace CleanAuth.Application.DTOs;

public class LoginResponse
{
    public int ExpiresIn { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
}
