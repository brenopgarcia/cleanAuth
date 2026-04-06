using DuschnerConsulting.Application.DTOs;
using MediatR;

namespace DuschnerConsulting.Application.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthTicket?>;
