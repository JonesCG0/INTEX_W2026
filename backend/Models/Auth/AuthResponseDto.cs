namespace backend.Models.Auth;

public sealed record AuthResponseDto(
    bool IsAuthenticated,
    string Email,
    string DisplayName,
    string Role
);
