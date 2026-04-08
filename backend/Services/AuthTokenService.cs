using System.Security.Claims;
using System.Text.Json;
using backend.Models;
using Microsoft.AspNetCore.DataProtection;

namespace backend.Services;

public sealed class AuthTokenService(IDataProtectionProvider dataProtectionProvider)
{
    private const string Purpose = "ProjectHaven.AuthToken.v1";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector(Purpose);

    public string CreateToken(AppUser user, IReadOnlyCollection<string> roles)
    {
        var payload = new AuthTokenPayload(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            roles.ToArray(),
            DateTimeOffset.UtcNow.AddHours(8)
        );

        return _protector.Protect(JsonSerializer.Serialize(payload, JsonOptions));
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var json = _protector.Unprotect(token);
            var payload = JsonSerializer.Deserialize<AuthTokenPayload>(json, JsonOptions);

            if (payload is null || payload.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                return null;
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, payload.UserId.ToString()),
                new(ClaimTypes.Email, payload.Email),
                new(ClaimTypes.Name, payload.Email),
                new("DisplayName", payload.DisplayName),
            };

            claims.AddRange(payload.Roles.Distinct(StringComparer.OrdinalIgnoreCase).Select(role => new Claim(ClaimTypes.Role, role)));

            var identity = new ClaimsIdentity(claims, "ProjectHavenToken");
            return new ClaimsPrincipal(identity);
        }
        catch
        {
            return null;
        }
    }

    private sealed record AuthTokenPayload(
        int UserId,
        string Email,
        string DisplayName,
        string[] Roles,
        DateTimeOffset ExpiresAt
    );
}
