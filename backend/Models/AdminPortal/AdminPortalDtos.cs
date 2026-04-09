namespace backend.Models.AdminPortal;

public sealed record AdminPortalOverviewDto(
    AdminPortalDashboardDto Dashboard,
    IReadOnlyList<AdminPortalDonorDto> Donors,
    IReadOnlyList<AdminPortalContributionDto> Contributions,
    IReadOnlyList<AdminPortalResidentDto> Residents,
    IReadOnlyList<AdminPortalRecordingDto> Recordings,
    IReadOnlyList<AdminPortalVisitationDto> Visitations,
    AdminPortalReportsDto Reports,
    DateTimeOffset GeneratedAt,
    IReadOnlyList<string> SourceTables
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
    string SupporterType,
    string? OrganizationName,
    string? FirstName,
    string? LastName,
    string? RelationshipType,
    string? Region,
    string? Country,
    string? Phone,
    string Status,
    decimal TotalGivenPhp,
    DateTime? FirstDonationAt,
    DateTime? LastDonationAt,
    string? AcquisitionChannel
);

public sealed record AdminPortalContributionDto(
    int Id,
    int DonorId,
    string DonorName,
    string DonationType,
    decimal? AmountPhp,
    decimal? EstimatedValuePhp,
    string ProgramArea,
    string Description,
    string? ChannelSource,
    string? CampaignName,
    DateTime ContributionAt,
    IReadOnlyList<AdminPortalDonationAllocationDto> Allocations
);

public sealed record AdminPortalResidentDto(
    int Id,
    string? CaseControlNo,
    string CodeName,
    int SafehouseId,
    string Safehouse,
    string CaseStatus,
    string? Sex,
    DateTime? DateOfBirth,
    string? BirthStatus,
    string? PlaceOfBirth,
    string? Religion,
    string CaseCategory,
    bool SubCatOrphaned,
    bool SubCatTrafficked,
    bool SubCatChildLabor,
    bool SubCatPhysicalAbuse,
    bool SubCatSexualAbuse,
    bool SubCatOsaec,
    bool SubCatCicl,
    bool SubCatAtRisk,
    bool SubCatStreetChild,
    bool SubCatChildWithHiv,
    bool IsPwd,
    string? PwdType,
    bool HasSpecialNeeds,
    string? SpecialNeedsDiagnosis,
    bool FamilyIs4Ps,
    bool FamilySoloParent,
    bool FamilyIndigenous,
    bool FamilyParentPwd,
    bool FamilyInformalSettler,
    DateTime? DateOfAdmission,
    string? AgeUponAdmission,
    string? PresentAge,
    string? LengthOfStay,
    string? ReferralSource,
    string? ReferringAgencyPerson,
    DateTime? DateColbRegistered,
    DateTime? DateColbObtained,
    string AssignedStaff,
    string? InitialCaseAssessment,
    DateTime? DateCaseStudyPrepared,
    string? ReintegrationType,
    string? ReintegrationStatus,
    string? InitialRiskLevel,
    string RiskLevel,
    DateTime? DateEnrolled,
    DateTime? DateClosed,
    DateTime? CreatedAt,
    string? NotesRestricted,
    int ProgressPercent,
    DateTime? LastSessionAt,
    DateTime? NextConferenceAt,
    int OpenInterventionPlans
);

public sealed record AdminPortalRecordingDto(
    int Id,
    int ResidentId,
    string ResidentName,
    DateTime SessionAt,
    string StaffName,
    string SessionType,
    int SessionDurationMinutes,
    string EmotionalState,
    string EmotionalStateEnd,
    string Summary,
    string Interventions,
    string FollowUp,
    bool ProgressNoted,
    bool ConcernsFlagged,
    bool ReferralMade,
    string? NotesRestricted
);

public sealed record AdminPortalVisitationDto(
    int Id,
    int ResidentId,
    string ResidentName,
    DateTime VisitAt,
    string SocialWorker,
    string VisitType,
    string LocationVisited,
    string? FamilyMembersPresent,
    string Purpose,
    string Observations,
    string FamilyCooperation,
    bool SafetyConcernsNoted,
    bool FollowUpNeeded,
    string? FollowUpNotes,
    string VisitOutcome
);

public sealed record AdminPortalReportsDto(
    IReadOnlyList<AdminPortalTrendPointDto> MonthlyTrends,
    IReadOnlyList<AdminPortalSafehouseComparisonDto> SafehouseComparison,
    IReadOnlyList<AdminPortalProgramOutcomeDto> ProgramOutcomes,
    IReadOnlyList<AdminPortalMlResidentPredictionDto> ReintegrationQueue,
    IReadOnlyList<AdminPortalConferenceDto> ConferenceSchedule,
    IReadOnlyList<AdminPortalSocialPerformanceDto> SocialPerformance
);

public sealed record AdminPortalTrendPointDto(
    string MonthLabel,
    int DonationsPhp,
    int ActiveResidents,
    int ProcessRecordings,
    int Visitations
);

public sealed record AdminPortalSafehouseComparisonDto(
    int SafehouseId,
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

public sealed record AdminPortalMlResidentPredictionDto(
    int ResidentId,
    string ResidentCode,
    string Safehouse,
    string CaseStatus,
    decimal ReintegrationReadinessProbability,
    bool PredictedReadyWithin180Days,
    DateTime? PredictionTimestamp,
    string ModelName
);

public sealed record AdminPortalDonationAllocationDto(
    int AllocationId,
    int? SafehouseId,
    string? Safehouse,
    string ProgramArea,
    decimal AmountAllocated,
    DateTime AllocationDate,
    string? AllocationNotes
);

public sealed record AdminPortalConferenceDto(
    int PlanId,
    int ResidentId,
    string ResidentCode,
    string Safehouse,
    string PlanCategory,
    string Status,
    DateTime ConferenceDate,
    DateTime? TargetDate,
    string PlanDescription,
    string? ServicesProvided
);

public sealed record AdminPortalSocialPerformanceDto(
    string Platform,
    int Posts,
    int Reach,
    int DonationReferrals,
    decimal EstimatedDonationValuePhp,
    decimal AvgEngagementRate
);

public sealed record AdminPortalSocialPostDto(
    int PostId,
    string Platform,
    string? PlatformPostId,
    string? PostUrl,
    DateTime? CreatedAt,
    string? PostType,
    string? ContentTopic,
    string? SentimentTone,
    bool HasCallToAction,
    string? CampaignName,
    int Impressions,
    int Reach,
    int Likes,
    int Comments,
    int Shares,
    int ClickThroughs,
    decimal EngagementRate,
    int DonationReferrals,
    decimal EstimatedDonationValuePhp
);

public sealed class UpdateDonorRequestDto : CreateDonorRequestDto;

public class CreateDonorRequestDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string? LinkedEmail { get; set; }
    public string SupporterType { get; set; } = "Individual";
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RelationshipType { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = "Active";
    public string? AcquisitionChannel { get; set; }
}

public class CreateContributionRequestDto
{
    public string DonationType { get; set; } = "Monetary";
    public decimal? AmountPhp { get; set; }
    public decimal? EstimatedValuePhp { get; set; }
    public string ProgramArea { get; set; } = "General Support";
    public string Description { get; set; } = string.Empty;
    public string? ChannelSource { get; set; }
    public string? CampaignName { get; set; }
    public bool IsRecurring { get; set; }
    public DateTime ContributionAt { get; set; }
    public List<CreateDonationAllocationRequestDto> Allocations { get; set; } = [];
}

public sealed class UpdateContributionRequestDto : CreateContributionRequestDto
{
    public int DonorId { get; set; }
}

public sealed class CreateDonationAllocationRequestDto
{
    public int? SafehouseId { get; set; }
    public string ProgramArea { get; set; } = string.Empty;
    public decimal AmountAllocated { get; set; }
    public DateTime? AllocationDate { get; set; }
    public string? AllocationNotes { get; set; }
}

public sealed class UpdateResidentRequestDto : CreateResidentRequestDto;

public class CreateResidentRequestDto
{
    public string? CaseControlNo { get; set; }
    public string CodeName { get; set; } = string.Empty;
    public int SafehouseId { get; set; }
    public string CaseStatus { get; set; } = "Active";
    public string? Sex { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BirthStatus { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? Religion { get; set; }
    public string CaseCategory { get; set; } = string.Empty;
    public bool SubCatOrphaned { get; set; }
    public bool SubCatTrafficked { get; set; }
    public bool SubCatChildLabor { get; set; }
    public bool SubCatPhysicalAbuse { get; set; }
    public bool SubCatSexualAbuse { get; set; }
    public bool SubCatOsaec { get; set; }
    public bool SubCatCicl { get; set; }
    public bool SubCatAtRisk { get; set; }
    public bool SubCatStreetChild { get; set; }
    public bool SubCatChildWithHiv { get; set; }
    public bool IsPwd { get; set; }
    public string? PwdType { get; set; }
    public bool HasSpecialNeeds { get; set; }
    public string? SpecialNeedsDiagnosis { get; set; }
    public bool FamilyIs4Ps { get; set; }
    public bool FamilySoloParent { get; set; }
    public bool FamilyIndigenous { get; set; }
    public bool FamilyParentPwd { get; set; }
    public bool FamilyInformalSettler { get; set; }
    public DateTime? DateOfAdmission { get; set; }
    public string? AgeUponAdmission { get; set; }
    public string? PresentAge { get; set; }
    public string? LengthOfStay { get; set; }
    public string? ReferralSource { get; set; }
    public string? ReferringAgencyPerson { get; set; }
    public DateTime? DateColbRegistered { get; set; }
    public DateTime? DateColbObtained { get; set; }
    public string AssignedStaff { get; set; } = string.Empty;
    public string? InitialCaseAssessment { get; set; }
    public DateTime? DateCaseStudyPrepared { get; set; }
    public string? ReintegrationType { get; set; }
    public string? ReintegrationStatus { get; set; }
    public string? InitialRiskLevel { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public DateTime? DateEnrolled { get; set; }
    public DateTime? DateClosed { get; set; }
    public string? NotesRestricted { get; set; }
}

public sealed class UpdateRecordingRequestDto : CreateRecordingRequestDto;

public class CreateRecordingRequestDto
{
    public int ResidentId { get; set; }
    public DateTime SessionAt { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string SessionType { get; set; } = "Individual";
    public int SessionDurationMinutes { get; set; }
    public string EmotionalState { get; set; } = string.Empty;
    public string EmotionalStateEnd { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Interventions { get; set; } = string.Empty;
    public string FollowUp { get; set; } = string.Empty;
    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
    public string? NotesRestricted { get; set; }
}

public sealed class UpdateVisitationRequestDto : CreateVisitationRequestDto;

public class CreateVisitationRequestDto
{
    public int ResidentId { get; set; }
    public DateTime VisitAt { get; set; }
    public string SocialWorker { get; set; } = string.Empty;
    public string VisitType { get; set; } = string.Empty;
    public string LocationVisited { get; set; } = string.Empty;
    public string? FamilyMembersPresent { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Observations { get; set; } = string.Empty;
    public string FamilyCooperation { get; set; } = string.Empty;
    public bool SafetyConcernsNoted { get; set; }
    public bool FollowUpNeeded { get; set; }
    public string? FollowUpNotes { get; set; }
    public string VisitOutcome { get; set; } = string.Empty;
}

public sealed class UpdateConferenceRequestDto : CreateConferenceRequestDto;

public class CreateConferenceRequestDto
{
    public int ResidentId { get; set; }
    public string PlanCategory { get; set; } = "Psychosocial";
    public string Status { get; set; } = "In Progress";
    public DateTime ConferenceDate { get; set; }
    public DateTime? TargetDate { get; set; }
    public string PlanDescription { get; set; } = string.Empty;
    public string? ServicesProvided { get; set; }
}
