namespace backend.Models.Auth;

public sealed record CurrentUserDto(
    bool IsAuthenticated,
    string? Email,
    string? DisplayName,
    string? Role
);
