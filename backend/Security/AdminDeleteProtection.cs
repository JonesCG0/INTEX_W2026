using Microsoft.AspNetCore.Http;

namespace backend.Security;

public static class AdminDeleteProtection
{
    public const string HeaderName = "X-ProjectHaven-Delete-Confirm";
    public const string RequiredValue = "DELETE";

    public static bool IsConfirmed(HttpRequest request)
    {
        var providedValue = request.Headers[HeaderName].ToString();
        return string.Equals(providedValue, RequiredValue, StringComparison.Ordinal);
    }
}
