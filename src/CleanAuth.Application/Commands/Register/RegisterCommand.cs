using CleanAuth.Application.DTOs;
using MediatR;

namespace CleanAuth.Application.Commands.Register;

public record RegisterCommand(string Email, string Password, string? UserName) : IRequest<AuthTicket?>;
