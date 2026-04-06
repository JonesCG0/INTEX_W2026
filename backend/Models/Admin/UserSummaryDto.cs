namespace backend.Models.Admin;

public sealed record UserSummaryDto(
    int Id,
    string Email,
    string DisplayName,
    string Role,
    bool LockoutEnabled,
    DateTimeOffset? LockoutEnd,
    int AccessFailedCount
);
