using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Options;
using DuschnerConsulting.Infrastructure.Data;
using DuschnerConsulting.Infrastructure.Repositories;
using DuschnerConsulting.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DuschnerConsulting.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<PublicDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<TenantSearchPathInterceptor>();

        services.AddDbContext<TenantDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<TenantSearchPathInterceptor>());
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAdminUserRepository, AdminUserRepository>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IAdminJwtTokenGenerator, AdminJwtTokenGenerator>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IPasswordResetService, PasswordResetService>();

        return services;
    }
}
