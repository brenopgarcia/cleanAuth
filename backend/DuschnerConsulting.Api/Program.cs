using System.Text;
using System.Threading.RateLimiting;
using DuschnerConsulting.Api;
using DuschnerConsulting.Api.Auth;
using DuschnerConsulting.Application;
using DuschnerConsulting.Application.Abstractions;
using DuschnerConsulting.Application.Options;
using DuschnerConsulting.Domain.Entities;
using DuschnerConsulting.Infrastructure;
using DuschnerConsulting.Infrastructure.Data;
using DuschnerConsulting.Api.Tenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddForwardedHeaders();
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<DuschnerConsulting.Application.Abstractions.ITenantContext>(sp => sp.GetRequiredService<TenantContext>());
builder.Services.AddScoped<IAuthorizationHandler, TenantPermissionHandler>();

var jwt = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException($"Configuration section '{JwtSettings.SectionName}' is missing or invalid.");

if (!builder.Environment.IsDevelopment())
{
    if (jwt.Secret.Length < 32
        || jwt.Secret.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException(
            "Jwt:Secret must be a strong key (at least 32 characters) and must not use the template placeholder in non-development environments.");
    }
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token)
                    && context.Request.Cookies.TryGetValue(AuthCookieNames.AccessToken, out var fromCookie))
                {
                    context.Token = fromCookie;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.Admin, policy =>
        policy.RequireClaim(AuthClaims.Role, AuthClaims.RoleAdmin));

    options.AddPolicy(AuthPolicies.TenantRead, policy =>
        policy.AddRequirements(new TenantPermissionRequirement(AuthClaims.PermTenantRead)));

    options.AddPolicy(AuthPolicies.TenantWrite, policy =>
        policy.AddRequirements(new TenantPermissionRequirement(AuthClaims.PermTenantWrite)));
});

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.HttpOnly = true;
});

// AddControllersWithViews registers antiforgery filter dependencies (ViewFeatures);
// AddControllers alone does not, which causes 500 when using AutoValidateAntiforgeryToken.
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddValidatorsFromAssemblyContaining<DuschnerConsulting.Application.DTOs.LoginRequest>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Too many attempts. Please try again shortly." },
            cancellationToken);
    };
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

builder.Services.AddOpenApi();

var app = builder.Build();
var startupLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseAntiforgery();

app.UseMiddleware<TenantResolutionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var publicDb = scope.ServiceProvider.GetRequiredService<PublicDbContext>();
    await publicDb.Database.MigrateAsync();
    if (app.Environment.IsDevelopment())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await PublicDbSeeder.SeedDemoAdminAsync(publicDb, hasher);

        if (!await publicDb.Tenants.AnyAsync())
        {
            var devTenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Slug = "dev",
                DisplayName = "Development Tenant",
                SchemaName = "tenant_dev",
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                ExpiresAt = DateTimeOffset.UtcNow.AddYears(10)
            };

            publicDb.Tenants.Add(devTenant);
            await publicDb.SaveChangesAsync();
            await publicDb.Database.ExecuteSqlAsync($"CREATE SCHEMA IF NOT EXISTS \"{devTenant.SchemaName}\";");
            startupLogger.LogInformation(
                "Provisioned default development tenant: slug={TenantSlug}, schema={SchemaName}.",
                devTenant.Slug,
                devTenant.SchemaName);
        }
    }

    var activeTenants = await publicDb.Tenants
        .AsNoTracking()
        .Where(t => t.IsActive && t.ExpiresAt > DateTimeOffset.UtcNow)
        .Select(t => new { t.Slug, t.SchemaName })
        .ToListAsync();

    var migratedCount = 0;
    var failedCount = 0;

    foreach (var tenant in activeTenants)
    {
        try
        {
            await using var tenantScope = app.Services.CreateAsyncScope();
            var tenantContext = tenantScope.ServiceProvider.GetRequiredService<ITenantContext>();
            var tenantDb = tenantScope.ServiceProvider.GetRequiredService<TenantDbContext>();

            tenantContext.SetGlobalAdminTarget(tenant.Slug, tenant.SchemaName);
            await tenantDb.Database.MigrateAsync();
            migratedCount++;
        }
        catch (Exception ex)
        {
            failedCount++;
            startupLogger.LogError(
                ex,
                "Failed migrating tenant schema for {TenantSlug} ({SchemaName}).",
                tenant.Slug,
                tenant.SchemaName);
        }
    }

    startupLogger.LogInformation(
        "Tenant schema migration summary: total={Total}, migrated={Migrated}, failed={Failed}.",
        activeTenants.Count,
        migratedCount,
        failedCount);

    if (failedCount > 0)
    {
        throw new InvalidOperationException("One or more tenant schema migrations failed. See startup logs for details.");
    }
}

app.Run();
