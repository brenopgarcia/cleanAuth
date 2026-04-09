using DuschnerConsulting.Application.DTOs;
using DuschnerConsulting.Application.Cqrs;

namespace DuschnerConsulting.Application.Commands.Login;

public sealed record LoginCommand(string Email, string Password) : ICommand<AuthTicket?>;
