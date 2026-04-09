using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

namespace DuschnerConsulting.Api;

internal static class ForwardedHeadersSetup
{
    internal static void AddForwardedHeaders(this IServiceCollection services)
    {
        services.AddOptions<ForwardedHeadersOptions>()
            .Configure<IConfiguration, IHostEnvironment>((options, config, env) =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;

                var forwardLimit = config.GetValue<int?>("ForwardedHeaders:ForwardLimit");
                if (forwardLimit is > 0)
                {
                    options.ForwardLimit = forwardLimit;
                }

                var trustAll = config.GetValue<bool>("ForwardedHeaders:TrustAllProxies");
                if (trustAll && env.IsDevelopment())
                {
                    options.KnownProxies.Clear();
                    options.KnownNetworks.Clear();
                    return;
                }

                foreach (var raw in config.GetSection("ForwardedHeaders:TrustedProxies").Get<string[]>()
                         ?? Array.Empty<string>())
                {
                    if (IPAddress.TryParse(raw.Trim(), out var ip))
                    {
                        options.KnownProxies.Add(ip);
                    }
                }

                foreach (var cidr in config.GetSection("ForwardedHeaders:TrustedNetworks").Get<string[]>()
                         ?? Array.Empty<string>())
                {
                    if (Microsoft.AspNetCore.HttpOverrides.IPNetwork.TryParse(cidr.Trim(), out var net))
                    {
                        options.KnownNetworks.Add(net);
                    }
                }
            });
    }
}
