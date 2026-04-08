using System.ComponentModel.DataAnnotations;

namespace backend.Models.Admin;

public sealed record CreateUserRequestDto(
    [Required][EmailAddress] string Email,
    [Required][MaxLength(256)] string DisplayName,
    [Required][MinLength(12)] string Password,
    [Required] string Role
);

public sealed record UpdateUserRequestDto(
    [Required][MaxLength(256)] string DisplayName,
    [Required] string Role
);
