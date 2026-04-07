namespace DuschnerConsulting.Api.Auth;

public static class AuthCookieNames
{
    public const string AccessToken = "access_token";
    public const string RefreshToken = "refresh_token";
}

public static class AccessTokenCookie
{
    public static void Append(HttpResponse response, HttpRequest request, string jwt, int maxAgeSeconds)
    {
        response.Cookies.Append(AuthCookieNames.AccessToken, jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = request.IsHttps,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromSeconds(maxAgeSeconds),
            Path = "/",
        });
    }

    public static void Delete(HttpResponse response) =>
        response.Cookies.Delete(AuthCookieNames.AccessToken, new CookieOptions { Path = "/" });
}

public static class RefreshTokenCookie
{
    public static void Append(HttpResponse response, HttpRequest request, string token, int maxAgeSeconds)
    {
        response.Cookies.Append(AuthCookieNames.RefreshToken, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = request.IsHttps,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromSeconds(maxAgeSeconds),
            Path = "/",
        });
    }

    public static void Delete(HttpResponse response) =>
        response.Cookies.Delete(AuthCookieNames.RefreshToken, new CookieOptions { Path = "/" });
}
