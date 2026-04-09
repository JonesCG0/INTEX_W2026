using System.ComponentModel.DataAnnotations;

namespace backend.Models.DonorPortal;

public sealed record DonorDashboardDto(
    string DisplayName,
    decimal TotalImpactPhp,
    int TotalDonations,
    DateTime? LastGiftingAt,
    IReadOnlyList<DonorContributionDto> Contributions,
    IReadOnlyList<SafehouseUpdateDto> SafehouseUpdates,
    IReadOnlyList<ImpactMetricDto> ImpactStats,
    DateTimeOffset GeneratedAt,
    IReadOnlyList<string> SourceTables
);

public sealed record DonorContributionDto(
    int Id,
    string Type,
    decimal? AmountPhp,
    string ProgramArea,
    string Description,
    DateTime Date
);

public sealed record SafehouseUpdateDto(
    string SafehouseName,
    string UpdateTitle,
    string UpdateDetail,
    DateTime PostedAt
);

public sealed record ImpactMetricDto(
    string Label,
    string Value,
    string Icon
);

public sealed record CreateDonationRequestDto(
    [Range(typeof(decimal), "1", "79228162514264337593543950335")] decimal AmountPhp,
    [MaxLength(120)] string? ProgramArea,
    [MaxLength(1000)] string? Notes,
    DateTime? ContributionAt
);

public sealed record CreateDonationResponseDto(
    int ContributionId,
    decimal AmountPhp,
    decimal TotalGivenPhp,
    int TotalDonations,
    DateTime ContributionAt
);
