using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Canonical;

[Table("safehouses")]
public sealed class Safehouse
{
    [Key]
    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("safehouse_code")]
    [MaxLength(50)]
    public string? SafehouseCode { get; set; }

    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("region")]
    [MaxLength(100)]
    public string? Region { get; set; }

    [Column("city")]
    [MaxLength(120)]
    public string? City { get; set; }

    [Column("province")]
    [MaxLength(120)]
    public string? Province { get; set; }

    [Column("country")]
    [MaxLength(120)]
    public string? Country { get; set; }

    [Column("open_date")]
    public DateTime? OpenDate { get; set; }

    [Column("status")]
    [MaxLength(40)]
    public string? Status { get; set; }

    [Column("capacity_girls")]
    public int? CapacityGirls { get; set; }

    [Column("capacity_staff")]
    public int? CapacityStaff { get; set; }

    [Column("current_occupancy")]
    public int? CurrentOccupancy { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }
}

[Table("supporters")]
public sealed class Supporter
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("supporter_type")]
    [MaxLength(80)]
    public string SupporterType { get; set; } = "Individual";

    [Column("display_name")]
    [MaxLength(256)]
    public string DisplayName { get; set; } = string.Empty;

    [Column("organization_name")]
    [MaxLength(256)]
    public string? OrganizationName { get; set; }

    [Column("first_name")]
    [MaxLength(120)]
    public string? FirstName { get; set; }

    [Column("last_name")]
    [MaxLength(120)]
    public string? LastName { get; set; }

    [Column("relationship_type")]
    [MaxLength(80)]
    public string? RelationshipType { get; set; }

    [Column("region")]
    [MaxLength(100)]
    public string? Region { get; set; }

    [Column("country")]
    [MaxLength(120)]
    public string? Country { get; set; }

    [Column("email")]
    [MaxLength(256)]
    public string? Email { get; set; }

    [Column("phone")]
    [MaxLength(80)]
    public string? Phone { get; set; }

    [Column("status")]
    [MaxLength(60)]
    public string Status { get; set; } = "Active";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("first_donation_date")]
    public DateTime? FirstDonationDate { get; set; }

    [Column("acquisition_channel")]
    [MaxLength(100)]
    public string? AcquisitionChannel { get; set; }

    public List<Donation> Donations { get; set; } = [];
}

[Table("social_media_posts")]
public sealed class SocialMediaPost
{
    [Key]
    [Column("post_id")]
    public int PostId { get; set; }

    [Column("platform")]
    [MaxLength(40)]
    public string Platform { get; set; } = string.Empty;

    [Column("platform_post_id")]
    [MaxLength(120)]
    public string? PlatformPostId { get; set; }

    [Column("post_url")]
    [MaxLength(500)]
    public string? PostUrl { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("post_type")]
    [MaxLength(80)]
    public string? PostType { get; set; }

    [Column("content_topic")]
    [MaxLength(80)]
    public string? ContentTopic { get; set; }

    [Column("sentiment_tone")]
    [MaxLength(80)]
    public string? SentimentTone { get; set; }

    [Column("has_call_to_action")]
    public bool? HasCallToAction { get; set; }

    [Column("campaign_name")]
    [MaxLength(160)]
    public string? CampaignName { get; set; }

    [Column("impressions")]
    public int? Impressions { get; set; }

    [Column("reach")]
    public int? Reach { get; set; }

    [Column("likes")]
    public int? Likes { get; set; }

    [Column("comments")]
    public int? Comments { get; set; }

    [Column("shares")]
    public int? Shares { get; set; }

    [Column("click_throughs")]
    public int? ClickThroughs { get; set; }

    [Column("engagement_rate")]
    public decimal? EngagementRate { get; set; }

    [Column("donation_referrals")]
    public int? DonationReferrals { get; set; }

    [Column("estimated_donation_value_php")]
    public decimal? EstimatedDonationValuePhp { get; set; }
}

[Table("donations")]
public sealed class Donation
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("donation_type")]
    [MaxLength(80)]
    public string DonationType { get; set; } = string.Empty;

    [Column("donation_date")]
    public DateTime DonationDate { get; set; }

    [Column("is_recurring")]
    public bool? IsRecurring { get; set; }

    [Column("campaign_name")]
    [MaxLength(160)]
    public string? CampaignName { get; set; }

    [Column("channel_source")]
    [MaxLength(100)]
    public string? ChannelSource { get; set; }

    [Column("currency_code")]
    [MaxLength(10)]
    public string? CurrencyCode { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("estimated_value")]
    public decimal? EstimatedValue { get; set; }

    [Column("impact_unit")]
    [MaxLength(50)]
    public string? ImpactUnit { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("referral_post_id")]
    public int? ReferralPostId { get; set; }

    public Supporter? Supporter { get; set; }
    public List<DonationAllocation> Allocations { get; set; } = [];
}

[Table("donation_allocations")]
public sealed class DonationAllocation
{
    [Key]
    [Column("allocation_id")]
    public int AllocationId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("safehouse_id")]
    public int? SafehouseId { get; set; }

    [Column("program_area")]
    [MaxLength(120)]
    public string ProgramArea { get; set; } = string.Empty;

    [Column("amount_allocated")]
    public decimal AmountAllocated { get; set; }

    [Column("allocation_date")]
    public DateTime AllocationDate { get; set; }

    [Column("allocation_notes")]
    public string? AllocationNotes { get; set; }

    public Donation? Donation { get; set; }
    public Safehouse? Safehouse { get; set; }
}

[Table("residents")]
public sealed class Resident
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("case_control_no")]
    [MaxLength(50)]
    public string? CaseControlNo { get; set; }

    [Column("internal_code")]
    [MaxLength(100)]
    public string InternalCode { get; set; } = string.Empty;

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("case_status")]
    [MaxLength(40)]
    public string CaseStatus { get; set; } = "Active";

    [Column("sex")]
    [MaxLength(10)]
    public string? Sex { get; set; }

    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }

    [Column("birth_status")]
    [MaxLength(40)]
    public string? BirthStatus { get; set; }

    [Column("place_of_birth")]
    [MaxLength(200)]
    public string? PlaceOfBirth { get; set; }

    [Column("religion")]
    [MaxLength(120)]
    public string? Religion { get; set; }

    [Column("case_category")]
    [MaxLength(80)]
    public string CaseCategory { get; set; } = string.Empty;

    [Column("sub_cat_orphaned")]
    public bool? SubCatOrphaned { get; set; }

    [Column("sub_cat_trafficked")]
    public bool? SubCatTrafficked { get; set; }

    [Column("sub_cat_child_labor")]
    public bool? SubCatChildLabor { get; set; }

    [Column("sub_cat_physical_abuse")]
    public bool? SubCatPhysicalAbuse { get; set; }

    [Column("sub_cat_sexual_abuse")]
    public bool? SubCatSexualAbuse { get; set; }

    [Column("sub_cat_osaec")]
    public bool? SubCatOsaec { get; set; }

    [Column("sub_cat_cicl")]
    public bool? SubCatCicl { get; set; }

    [Column("sub_cat_at_risk")]
    public bool? SubCatAtRisk { get; set; }

    [Column("sub_cat_street_child")]
    public bool? SubCatStreetChild { get; set; }

    [Column("sub_cat_child_with_hiv")]
    public bool? SubCatChildWithHiv { get; set; }

    [Column("is_pwd")]
    public bool? IsPwd { get; set; }

    [Column("pwd_type")]
    [MaxLength(120)]
    public string? PwdType { get; set; }

    [Column("has_special_needs")]
    public bool? HasSpecialNeeds { get; set; }

    [Column("special_needs_diagnosis")]
    [MaxLength(200)]
    public string? SpecialNeedsDiagnosis { get; set; }

    [Column("family_is_4ps")]
    public bool? FamilyIs4Ps { get; set; }

    [Column("family_solo_parent")]
    public bool? FamilySoloParent { get; set; }

    [Column("family_indigenous")]
    public bool? FamilyIndigenous { get; set; }

    [Column("family_parent_pwd")]
    public bool? FamilyParentPwd { get; set; }

    [Column("family_informal_settler")]
    public bool? FamilyInformalSettler { get; set; }

    [Column("date_of_admission")]
    public DateTime? DateOfAdmission { get; set; }

    [Column("age_upon_admission")]
    [MaxLength(80)]
    public string? AgeUponAdmission { get; set; }

    [Column("present_age")]
    [MaxLength(80)]
    public string? PresentAge { get; set; }

    [Column("length_of_stay")]
    [MaxLength(80)]
    public string? LengthOfStay { get; set; }

    [Column("referral_source")]
    [MaxLength(120)]
    public string? ReferralSource { get; set; }

    [Column("referring_agency_person")]
    [MaxLength(200)]
    public string? ReferringAgencyPerson { get; set; }

    [Column("date_colb_registered")]
    public DateTime? DateColbRegistered { get; set; }

    [Column("date_colb_obtained")]
    public DateTime? DateColbObtained { get; set; }

    [Column("assigned_social_worker")]
    [MaxLength(160)]
    public string? AssignedSocialWorker { get; set; }

    [Column("initial_case_assessment")]
    public string? InitialCaseAssessment { get; set; }

    [Column("date_case_study_prepared")]
    public DateTime? DateCaseStudyPrepared { get; set; }

    [Column("reintegration_type")]
    [MaxLength(120)]
    public string? ReintegrationType { get; set; }

    [Column("reintegration_status")]
    [MaxLength(80)]
    public string? ReintegrationStatus { get; set; }

    [Column("initial_risk_level")]
    [MaxLength(40)]
    public string? InitialRiskLevel { get; set; }

    [Column("current_risk_level")]
    [MaxLength(40)]
    public string? CurrentRiskLevel { get; set; }

    [Column("date_enrolled")]
    public DateTime? DateEnrolled { get; set; }

    [Column("date_closed")]
    public DateTime? DateClosed { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("notes_restricted")]
    public string? NotesRestricted { get; set; }

    public Safehouse? Safehouse { get; set; }
    public List<ProcessRecording> ProcessRecordings { get; set; } = [];
    public List<HomeVisitation> HomeVisitations { get; set; } = [];
    public List<InterventionPlan> InterventionPlans { get; set; } = [];
}

[Table("process_recordings")]
public sealed class ProcessRecording
{
    [Key]
    [Column("recording_id")]
    public int RecordingId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("session_date")]
    public DateTime SessionDate { get; set; }

    [Column("social_worker")]
    [MaxLength(160)]
    public string SocialWorker { get; set; } = string.Empty;

    [Column("session_type")]
    [MaxLength(40)]
    public string SessionType { get; set; } = string.Empty;

    [Column("session_duration_minutes")]
    public int SessionDurationMinutes { get; set; }

    [Column("emotional_state_observed")]
    [MaxLength(80)]
    public string EmotionalStateObserved { get; set; } = string.Empty;

    [Column("emotional_state_end")]
    [MaxLength(80)]
    public string EmotionalStateEnd { get; set; } = string.Empty;

    [Column("session_narrative")]
    public string SessionNarrative { get; set; } = string.Empty;

    [Column("interventions_applied")]
    public string InterventionsApplied { get; set; } = string.Empty;

    [Column("follow_up_actions")]
    public string FollowUpActions { get; set; } = string.Empty;

    [Column("progress_noted")]
    public bool ProgressNoted { get; set; }

    [Column("concerns_flagged")]
    public bool ConcernsFlagged { get; set; }

    [Column("referral_made")]
    public bool ReferralMade { get; set; }

    [Column("notes_restricted")]
    public string? NotesRestricted { get; set; }

    public Resident? Resident { get; set; }
}

[Table("home_visitations")]
public sealed class HomeVisitation
{
    [Key]
    [Column("visitation_id")]
    public int VisitationId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("visit_date")]
    public DateTime VisitDate { get; set; }

    [Column("social_worker")]
    [MaxLength(160)]
    public string SocialWorker { get; set; } = string.Empty;

    [Column("visit_type")]
    [MaxLength(80)]
    public string VisitType { get; set; } = string.Empty;

    [Column("location_visited")]
    [MaxLength(240)]
    public string LocationVisited { get; set; } = string.Empty;

    [Column("family_members_present")]
    public string? FamilyMembersPresent { get; set; }

    [Column("purpose")]
    public string Purpose { get; set; } = string.Empty;

    [Column("observations")]
    public string Observations { get; set; } = string.Empty;

    [Column("family_cooperation_level")]
    [MaxLength(80)]
    public string FamilyCooperationLevel { get; set; } = string.Empty;

    [Column("safety_concerns_noted")]
    public bool SafetyConcernsNoted { get; set; }

    [Column("follow_up_needed")]
    public bool FollowUpNeeded { get; set; }

    [Column("follow_up_notes")]
    public string? FollowUpNotes { get; set; }

    [Column("visit_outcome")]
    [MaxLength(80)]
    public string VisitOutcome { get; set; } = string.Empty;

    public Resident? Resident { get; set; }
}

[Table("intervention_plans")]
public sealed class InterventionPlan
{
    [Key]
    [Column("plan_id")]
    public int PlanId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("plan_category")]
    [MaxLength(80)]
    public string PlanCategory { get; set; } = string.Empty;

    [Column("plan_description")]
    public string PlanDescription { get; set; } = string.Empty;

    [Column("services_provided")]
    public string? ServicesProvided { get; set; }

    [Column("target_value")]
    public decimal? TargetValue { get; set; }

    [Column("target_date")]
    public DateTime? TargetDate { get; set; }

    [Column("status")]
    [MaxLength(60)]
    public string Status { get; set; } = string.Empty;

    [Column("case_conference_date")]
    public DateTime? CaseConferenceDate { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public Resident? Resident { get; set; }
}
