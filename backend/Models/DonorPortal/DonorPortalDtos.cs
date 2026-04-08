namespace backend.Models.DonorPortal;

public sealed record DonorDashboardDto(
    string DisplayName,
    decimal TotalImpactPhp,
    int TotalDonations,
    DateTime? LastGiftingAt,
    IReadOnlyList<DonorContributionDto> Contributions,
    IReadOnlyList<SafehouseUpdateDto> SafehouseUpdates,
    IReadOnlyList<ImpactMetricDto> ImpactStats
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
