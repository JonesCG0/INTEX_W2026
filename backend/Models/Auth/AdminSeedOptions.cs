namespace backend.Models.Auth;

public sealed class AdminSeedOptions
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string DisplayName { get; set; } = "Project Haven Admin";
}
