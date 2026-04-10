using Microsoft.AspNetCore.Http;

namespace backend.Security;

// Requires callers to include a specific HTTP header to confirm destructive DELETE actions.
// This prevents accidental deletions from a simple UI click or mis-fired request.
public static class AdminDeleteProtection
{
    public const string HeaderName = "X-ProjectHaven-Delete-Confirm";
    public const string RequiredValue = "DELETE";

    // Returns true only if the request includes the correct confirmation header value.
    public static bool IsConfirmed(HttpRequest request)
    {
        var providedValue = request.Headers[HeaderName].ToString();
        return string.Equals(providedValue, RequiredValue, StringComparison.Ordinal);
    }
}
