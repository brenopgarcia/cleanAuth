using DuschnerConsulting.Application.Commands.Login;
using DuschnerConsulting.Application.Commands.Register;
using DuschnerConsulting.Application.Cqrs;
using DuschnerConsulting.Application.DTOs;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace DuschnerConsulting.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICommandDispatcher, CommandDispatcher>();
        services.AddScoped<ICommandHandler<LoginCommand, AuthTicket?>, LoginCommandHandler>();
        services.AddScoped<ICommandHandler<RegisterCommand, AuthTicket?>, RegisterCommandHandler>();
        services.AddScoped<IAdminAuthService, AdminAuthService>();

        return services;
    }
}
