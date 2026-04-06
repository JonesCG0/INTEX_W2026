using System.ComponentModel.DataAnnotations;

namespace backend.Models.Auth;

public sealed record RegisterRequestDto(
    [Required][EmailAddress] string Email,
    [Required][MaxLength(256)] string DisplayName,
    [Required][MinLength(12)] string Password,
    [Required] string ConfirmPassword
);
