namespace backend.Models.Public;

public sealed record ImpactDashboardDto(
    ImpactHeroDto Hero,
    IReadOnlyList<ImpactMetricDto> Metrics,
    IReadOnlyList<ImpactTrendPointDto> DonationTrend,
    IReadOnlyList<ImpactPlatformDto> PlatformPerformance,
    IReadOnlyList<ImpactSafehouseDto> Safehouses,
    IReadOnlyList<ImpactSnapshotDto> Snapshots,
    DateTimeOffset GeneratedAt,
    IReadOnlyList<string> SourceTables
);

public sealed record ImpactHeroDto(
    string Headline,
    string Summary,
    string PublishedLabel,
    string UpdatedLabel
);

public sealed record ImpactMetricDto(
    string Label,
    string ValueDisplay,
    string Detail
);

public sealed record ImpactTrendPointDto(
    string MonthLabel,
    decimal DonationAmountPhp,
    int ActiveResidents,
    decimal AvgEducationProgress,
    decimal AvgHealthScore
);

public sealed record ImpactPlatformDto(
    string Platform,
    int Reach,
    int DonationReferrals,
    decimal EngagementRate
);

public sealed record ImpactSafehouseDto(
    int SafehouseId,
    string Name,
    string Region,
    string City,
    int CurrentOccupancy,
    int CapacityGirls,
    int CapacityStaff,
    decimal? AvgEducationProgress,
    decimal? AvgHealthScore,
    string? LatestMonthLabel
);

public sealed record ImpactSnapshotDto(
    DateTime SnapshotDate,
    string Headline,
    string Summary,
    DateTime? PublishedAt
);
