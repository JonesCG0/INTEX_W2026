namespace backend.Models.Auth;

public sealed class AdminSeedOptions
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string DisplayName { get; set; } = "Project Haven Admin";

    public string DonorEmail { get; set; } = string.Empty;

    public string DonorPassword { get; set; } = string.Empty;

    public string DonorDisplayName { get; set; } = "Project Haven Donor";
}
