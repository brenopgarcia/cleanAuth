using DuschnerConsulting.Application.DTOs;
using MediatR;

namespace DuschnerConsulting.Application.Commands.Register;

public record RegisterCommand(string Email, string Password, string? UserName) : IRequest<AuthTicket?>;
