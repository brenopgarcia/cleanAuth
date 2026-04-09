using DuschnerConsulting.Application.DTOs;
using DuschnerConsulting.Application.Cqrs;

namespace DuschnerConsulting.Application.Commands.Register;

public sealed record RegisterCommand(string Email, string Password, string? UserName) : ICommand<AuthTicket?>;
