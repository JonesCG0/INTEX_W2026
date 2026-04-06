using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public sealed class AppUser
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; }
}
