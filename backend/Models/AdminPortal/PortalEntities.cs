namespace backend.Models.AdminPortal;

public sealed class PortalDonor
{
    public int Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? LinkedEmail { get; set; }
    public string DonorType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalGivenPhp { get; set; }
    public DateTime? LastDonationAt { get; set; }
    public string PreferredChannel { get; set; } = string.Empty;
    public string StewardshipLead { get; set; } = string.Empty;
    public List<PortalContribution> Contributions { get; set; } = [];
}

public sealed class PortalContribution
{
    public int Id { get; set; }
    public int DonorId { get; set; }
    public string ContributionType { get; set; } = string.Empty;
    public decimal? AmountPhp { get; set; }
    public decimal? EstimatedValuePhp { get; set; }
    public string ProgramArea { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ContributionAt { get; set; }
    public PortalDonor? Donor { get; set; }
}

public sealed class PortalResident
{
    public int Id { get; set; }
    public string CodeName { get; set; } = string.Empty;
    public string Safehouse { get; set; } = string.Empty;
    public string CaseCategory { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string AssignedStaff { get; set; } = string.Empty;
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
    public string StaffName { get; set; } = string.Empty;
    public string SessionType { get; set; } = string.Empty;
    public string EmotionalState { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Interventions { get; set; } = string.Empty;
    public string FollowUp { get; set; } = string.Empty;
    public PortalResident? Resident { get; set; }
}

public sealed class PortalVisitation
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public DateTime VisitAt { get; set; }
    public string VisitType { get; set; } = string.Empty;
    public string Observations { get; set; } = string.Empty;
    public string FamilyCooperation { get; set; } = string.Empty;
    public string SafetyConcerns { get; set; } = string.Empty;
    public string FollowUp { get; set; } = string.Empty;
    public PortalResident? Resident { get; set; }
}
