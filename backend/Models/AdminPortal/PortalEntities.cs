namespace backend.Models.AdminPortal;

public sealed class PortalDonor
{
    public int Id { get; set; }
    public string? DisplayName { get; set; }
    public string? LinkedEmail { get; set; }
    public string? DonorType { get; set; }
    public string? Status { get; set; }
    public decimal TotalGivenPhp { get; set; }
    public DateTime? LastDonationAt { get; set; }
    public string? PreferredChannel { get; set; }
    public string? StewardshipLead { get; set; }
    public List<PortalContribution> Contributions { get; set; } = [];
}

public sealed class PortalContribution
{
    public int Id { get; set; }
    public int DonorId { get; set; }
    public string? ContributionType { get; set; }
    public decimal? AmountPhp { get; set; }
    public decimal? EstimatedValuePhp { get; set; }
    public string? ProgramArea { get; set; }
    public string? Description { get; set; }
    public DateTime ContributionAt { get; set; }
    public PortalDonor? Donor { get; set; }
}

public sealed class PortalResident
{
    public int Id { get; set; }
    public string? CodeName { get; set; }
    public string? Safehouse { get; set; }
    public string? CaseCategory { get; set; }
    public string? RiskLevel { get; set; }
    public string? Status { get; set; }
    public string? AssignedStaff { get; set; }
    public int ProgressPercent { get; set; }
    public DateTime? LastSessionAt { get; set; }
    public DateTime? NextReviewAt { get; set; }
    public List<PortalRecording> Recordings { get; set; } = [];
    public List<PortalVisitation> Visitations { get; set; } = [];
}

public sealed class PortalRecording
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime SessionAt { get; set; }
    public string? StaffName { get; set; }
    public string? SessionType { get; set; }
    public string? EmotionalState { get; set; }
    public string? Summary { get; set; }
    public string? Interventions { get; set; }
    public string? FollowUp { get; set; }
    public PortalResident? Resident { get; set; }
}

public sealed class PortalVisitation
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime VisitAt { get; set; }
    public string? VisitType { get; set; }
    public string? Observations { get; set; }
    public string? FamilyCooperation { get; set; }
    public string? SafetyConcerns { get; set; }
    public string? FollowUp { get; set; }
    public PortalResident? Resident { get; set; }
}
