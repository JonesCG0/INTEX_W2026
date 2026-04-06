using Microsoft.AspNetCore.Identity;

namespace backend.Models;

public sealed class AppUser : IdentityUser<int>
{
    public string DisplayName { get; set; } = string.Empty;
}
