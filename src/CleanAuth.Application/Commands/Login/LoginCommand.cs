using CleanAuth.Application.DTOs;
using MediatR;

namespace CleanAuth.Application.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthTicket?>;
