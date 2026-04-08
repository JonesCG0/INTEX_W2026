namespace backend.Models.AdminPortal;

public sealed record AdminPortalOverviewDto(
    AdminPortalDashboardDto Dashboard,
    IReadOnlyList<AdminPortalDonorDto> Donors,
    IReadOnlyList<AdminPortalContributionDto> Contributions,
    IReadOnlyList<AdminPortalResidentDto> Residents,
    IReadOnlyList<AdminPortalRecordingDto> Recordings,
    IReadOnlyList<AdminPortalVisitationDto> Visitations,
    AdminPortalReportsDto Reports,
    DateTimeOffset GeneratedAt
);

public sealed record AdminPortalDashboardDto(
    IReadOnlyList<AdminPortalMetricDto> Metrics,
    IReadOnlyList<AdminPortalAlertDto> Alerts,
    IReadOnlyList<AdminPortalActivityDto> RecentActivity
);

public sealed record AdminPortalMetricDto(
    string Label,
    string Value,
    string Detail
);

public sealed record AdminPortalAlertDto(
    string Severity,
    string Title,
    string Detail
);

public sealed record AdminPortalActivityDto(
    DateTime ActivityAt,
    string Label,
    string Detail
);

public sealed record AdminPortalDonorDto(
    int Id,
    string DisplayName,
    string? LinkedEmail,
    string DonorType,
    string Status,
    decimal TotalGivenPhp,
    DateTime? LastDonationAt,
    string PreferredChannel,
    string StewardshipLead
);

public sealed record AdminPortalContributionDto(
    int Id,
    int DonorId,
    string DonorName,
    string ContributionType,
    decimal? AmountPhp,
    decimal? EstimatedValuePhp,
    string ProgramArea,
    string Description,
    DateTime ContributionAt
);

public sealed record AdminPortalResidentDto(
    int Id,
    string CodeName,
    string Safehouse,
    string CaseCategory,
    string RiskLevel,
    string Status,
    string AssignedStaff,
    int ProgressPercent,
    DateTime? LastSessionAt,
    DateTime? NextReviewAt
);

public sealed record AdminPortalRecordingDto(
    int Id,
    int ResidentId,
    string ResidentName,
    DateTime SessionAt,
    string StaffName,
    string SessionType,
    string EmotionalState,
    string Summary,
    string Interventions,
    string FollowUp
);

public sealed record AdminPortalVisitationDto(
    int Id,
    int ResidentId,
    string ResidentName,
    DateTime VisitAt,
    string VisitType,
    string Observations,
    string FamilyCooperation,
    string SafetyConcerns,
    string FollowUp
);

public sealed record AdminPortalReportsDto(
    IReadOnlyList<AdminPortalTrendPointDto> MonthlyTrends,
    IReadOnlyList<AdminPortalSafehouseComparisonDto> SafehouseComparison,
    IReadOnlyList<AdminPortalProgramOutcomeDto> ProgramOutcomes
);

public sealed record AdminPortalTrendPointDto(
    string MonthLabel,
    int DonationsPhp,
    int ActiveResidents,
    int ProcessRecordings,
    int Visitations
);

public sealed record AdminPortalSafehouseComparisonDto(
    string Safehouse,
    int Occupancy,
    int Capacity,
    int ActiveResidents,
    int HighRiskResidents
);

public sealed record AdminPortalProgramOutcomeDto(
    string ProgramArea,
    string Outcome,
    string Value
);

public sealed record UpdateDonorRequestDto(
    string DisplayName,
    string? LinkedEmail,
    string DonorType,
    string Status,
    string PreferredChannel,
    string StewardshipLead
);

public sealed record CreateDonorRequestDto(
    string DisplayName,
    string? LinkedEmail,
    string DonorType,
    string Status,
    string PreferredChannel,
    string StewardshipLead
);

public sealed record CreateContributionRequestDto(
    string ContributionType,
    decimal? AmountPhp,
    decimal? EstimatedValuePhp,
    string ProgramArea,
    string Description,
    DateTime ContributionAt
);

public sealed record UpdateContributionRequestDto(
    int DonorId,
    string ContributionType,
    decimal? AmountPhp,
    decimal? EstimatedValuePhp,
    string ProgramArea,
    string Description,
    DateTime ContributionAt
);

public sealed record CreateResidentRequestDto(
    string CodeName,
    string Safehouse,
    string CaseCategory,
    string RiskLevel,
    string Status,
    string AssignedStaff,
    int ProgressPercent,
    DateTime? NextReviewAt
);

public sealed record UpdateResidentRequestDto(
    string CodeName,
    string Safehouse,
    string CaseCategory,
    string RiskLevel,
    string Status,
    string AssignedStaff,
    int ProgressPercent,
    DateTime? NextReviewAt
);

public sealed record CreateRecordingRequestDto(
    int ResidentId,
    DateTime SessionAt,
    string StaffName,
    string SessionType,
    string EmotionalState,
    string Summary,
    string Interventions,
    string FollowUp
);

public sealed record UpdateRecordingRequestDto(
    int ResidentId,
    DateTime SessionAt,
    string StaffName,
    string SessionType,
    string EmotionalState,
    string Summary,
    string Interventions,
    string FollowUp
);

public sealed record CreateVisitationRequestDto(
    int ResidentId,
    DateTime VisitAt,
    string VisitType,
    string Observations,
    string FamilyCooperation,
    string SafetyConcerns,
    string FollowUp
);

public sealed record UpdateVisitationRequestDto(
    int ResidentId,
    DateTime VisitAt,
    string VisitType,
    string Observations,
    string FamilyCooperation,
    string SafetyConcerns,
    string FollowUp
);
