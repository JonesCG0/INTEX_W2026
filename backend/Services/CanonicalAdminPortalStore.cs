using System.Data.Common;
using backend.Data;
using backend.Models.AdminPortal;
using backend.Models.Canonical;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class CanonicalAdminPortalStore(AppDbContext db)
{
    public async Task SeedAsync()
    {
        // Backfill canonical tables from portal_* when legacy data exists.
        if (await db.PortalDonors.AnyAsync())
        {
            await BackfillSupportersAndDonationsAsync();
        }

        if (await db.PortalResidents.AnyAsync())
        {
            await BackfillResidentsAsync();
            await BackfillRecordingsAsync();
            await BackfillVisitationsAsync();
        }
    }

    public async Task<AdminPortalOverviewDto> GetOverviewAsync()
    {
        var donors = await db.Supporters
            .AsNoTracking()
            .Include(s => s.Donations)
            .OrderByDescending(s => s.CreatedAt ?? DateTime.MinValue)
            .ThenBy(s => s.DisplayName)
            .ToListAsync();

        var contributions = await db.Donations
            .AsNoTracking()
            .Include(d => d.Supporter)
            .Include(d => d.Allocations)
            .ThenInclude(a => a.Safehouse)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        var residents = await db.Residents
            .AsNoTracking()
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings)
            .Include(r => r.InterventionPlans)
            .OrderByDescending(r => r.DateOfAdmission ?? r.CreatedAt ?? DateTime.MinValue)
            .ThenBy(r => r.InternalCode)
            .ToListAsync();

        var recordings = await db.ProcessRecordings
            .AsNoTracking()
            .Include(r => r.Resident)
            .OrderByDescending(r => r.SessionDate)
            .Take(500)
            .ToListAsync();

        var visitations = await db.HomeVisitations
            .AsNoTracking()
            .Include(v => v.Resident)
            .OrderByDescending(v => v.VisitDate)
            .Take(500)
            .ToListAsync();

        var monthlyTrends = await BuildMonthlyTrendsAsync();
        var safehouseComparison = await ReadSafehouseComparisonAsync();
        var programOutcomes = await ReadProgramOutcomesAsync();
        var reintegrationQueue = await ReadReintegrationQueueAsync();
        var conferenceSchedule = await ReadConferenceScheduleAsync();
        var socialPerformance = await ReadSocialPerformanceAsync();

        var donorDtos = donors
            .Select(MapSupporter)
            .OrderByDescending(d => d.TotalGivenPhp)
            .ToArray();

        var contributionDtos = contributions
            .Select(MapDonation)
            .ToArray();

        var residentDtos = residents
            .Select(MapResident)
            .ToArray();

        var recordingDtos = recordings
            .Select(MapRecording)
            .ToArray();

        var visitationDtos = visitations
            .Select(MapVisitation)
            .ToArray();

        var dashboard = BuildDashboard(
            residentDtos,
            donorDtos,
            contributionDtos,
            recordingDtos,
            visitationDtos,
            conferenceSchedule);

        return new AdminPortalOverviewDto(
            dashboard,
            donorDtos,
            contributionDtos,
            residentDtos,
            recordingDtos,
            visitationDtos,
            new AdminPortalReportsDto(
                monthlyTrends,
                safehouseComparison,
                programOutcomes,
                reintegrationQueue,
                conferenceSchedule,
                socialPerformance),
            DateTimeOffset.UtcNow,
            [
                "supporters",
                "donations",
                "donation_allocations",
                "residents",
                "process_recordings",
                "home_visitations",
                "intervention_plans",
                "safehouses",
                "education_records",
                "health_wellbeing_records",
                "social_media_posts",
                "ml_resident_reintegration_scores"
            ]);
    }

    public async Task<DonorRelationshipOkrsDto> GetDonorRelationshipOkrsAsync()
    {
        var now = DateTime.UtcNow;
        var currentStart = now.AddMonths(-12);
        var priorStart = now.AddMonths(-24);

        var portalEligibleSupporters = await db.Supporters
            .AsNoTracking()
            .Where(s => s.Email != null && s.Email.Trim().Length > 0)
            .Select(s => s.SupporterId)
            .ToHashSetAsync();

        var donations = await db.Donations
            .AsNoTracking()
            .Where(d => d.DonationDate >= priorStart && d.DonationDate <= now)
            .Select(d => new
            {
                d.SupporterId,
                d.DonationDate,
                Value = d.Amount ?? d.EstimatedValue ?? 0m,
                d.Notes
            })
            .ToListAsync();

        var retentionNumerator = 0;
        var retentionDenominator = 0;
        var upgradeNumerator = 0;
        var upgradeDenominator = 0;
        var portalNumerator = 0;
        var portalDenominator = 0;

        foreach (var supporterDonations in donations.GroupBy(d => d.SupporterId))
        {
            var priorAny = false;
            var currentAny = false;
            var priorTotal = 0m;
            var currentTotal = 0m;
            var hasSelfServiceInCurrent = false;

            foreach (var donation in supporterDonations)
            {
                if (donation.DonationDate >= priorStart && donation.DonationDate < currentStart)
                {
                    priorAny = true;
                    priorTotal += donation.Value;
                }

                if (donation.DonationDate >= currentStart && donation.DonationDate <= now)
                {
                    currentAny = true;
                    currentTotal += donation.Value;
                    if (IsSelfServiceDonorGift(donation.Notes))
                    {
                        hasSelfServiceInCurrent = true;
                    }
                }
            }

            if (priorAny)
            {
                retentionDenominator++;
                if (currentAny)
                {
                    retentionNumerator++;
                }
            }

            if (priorAny && currentAny)
            {
                upgradeDenominator++;
                if (currentTotal > priorTotal)
                {
                    upgradeNumerator++;
                }
            }

            if (portalEligibleSupporters.Contains(supporterDonations.Key) && currentAny)
            {
                portalDenominator++;
                if (hasSelfServiceInCurrent)
                {
                    portalNumerator++;
                }
            }
        }

        return new DonorRelationshipOkrsDto(
            "Strengthen donor relationships so supporters stay engaged over time, deepen their giving when they continue, and use the donor portal to stay connected to impact.",
            "Windows are rolling 12-month UTC periods. Current window: now minus 12 months through now. Prior window: now minus 24 months through now minus 12 months.",
            DateTimeOffset.UtcNow,
            new DonorRelationshipKrDto(
                "Retention rate",
                "Share of supporters who gave in the prior 12-month window and gave again in the current 12-month window.",
                "Retention rate = donors with gifts in both prior and current windows / donors with gifts in prior window * 100.",
                PercentOrNull(retentionNumerator, retentionDenominator),
                retentionNumerator,
                retentionDenominator
            ),
            new DonorRelationshipKrDto(
                "Upgrade rate",
                "Among supporters active in both windows, share whose total current-window giving exceeds their prior-window giving.",
                "Upgrade rate = donors active in both windows with current total > prior total / donors active in both windows * 100.",
                PercentOrNull(upgradeNumerator, upgradeDenominator),
                upgradeNumerator,
                upgradeDenominator
            ),
            new DonorRelationshipKrDto(
                "Portal engagement rate",
                "Among portal-eligible supporters active in the current window, share who submitted at least one self-service donor gift.",
                "Portal engagement rate = portal-eligible donors with >=1 self-service gift in current window / portal-eligible donors with >=1 gift in current window * 100.",
                PercentOrNull(portalNumerator, portalDenominator),
                portalNumerator,
                portalDenominator
            )
        );
    }

    public async Task<AdminPortalDonorDto> AddDonorAsync(CreateDonorRequestDto request)
    {
        var normalizedEmail = NormalizeNullable(request.LinkedEmail);
        if (normalizedEmail is not null && await db.Supporters.AnyAsync(s => s.Email == normalizedEmail))
        {
            throw new InvalidOperationException("A donor profile with that email already exists.");
        }

        var displayName = CleanRequired(request.DisplayName);
        var supporter = new Supporter
        {
            DisplayName = displayName,
            Email = normalizedEmail,
            SupporterType = CleanRequired(request.SupporterType, "Individual"),
            OrganizationName = NormalizeNullable(request.OrganizationName),
            FirstName = NormalizeNullable(request.FirstName),
            LastName = NormalizeNullable(request.LastName),
            RelationshipType = NormalizeNullable(request.RelationshipType) ?? "Direct",
            Region = NormalizeNullable(request.Region) ?? "Unspecified",
            Country = NormalizeNullable(request.Country) ?? "Philippines",
            Phone = NormalizeNullable(request.Phone),
            Status = CleanRequired(request.Status, "Active"),
            CreatedAt = DateTime.UtcNow,
            AcquisitionChannel = NormalizeNullable(request.AcquisitionChannel) ?? "Direct"
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync();
        await db.Entry(supporter).Collection(s => s.Donations).LoadAsync();
        return MapSupporter(supporter);
    }

    public async Task<AdminPortalDonorDto> UpdateDonorAsync(int id, UpdateDonorRequestDto request)
    {
        var supporter = await db.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.SupporterId == id)
            ?? throw new KeyNotFoundException("Donor not found.");

        var normalizedEmail = NormalizeNullable(request.LinkedEmail);
        if (normalizedEmail is not null && await db.Supporters.AnyAsync(s => s.Email == normalizedEmail && s.SupporterId != id))
        {
            throw new InvalidOperationException("A donor profile with that email already exists.");
        }

        supporter.DisplayName = CleanRequired(request.DisplayName);
        supporter.Email = normalizedEmail;
        supporter.SupporterType = CleanRequired(request.SupporterType, supporter.SupporterType);
        supporter.OrganizationName = NormalizeNullable(request.OrganizationName);
        supporter.FirstName = NormalizeNullable(request.FirstName);
        supporter.LastName = NormalizeNullable(request.LastName);
        supporter.RelationshipType = NormalizeNullable(request.RelationshipType) ?? supporter.RelationshipType;
        supporter.Region = NormalizeNullable(request.Region) ?? supporter.Region;
        supporter.Country = NormalizeNullable(request.Country) ?? supporter.Country;
        supporter.Phone = NormalizeNullable(request.Phone);
        supporter.Status = CleanRequired(request.Status, supporter.Status);
        supporter.AcquisitionChannel = NormalizeNullable(request.AcquisitionChannel) ?? supporter.AcquisitionChannel;
        await db.SaveChangesAsync();
        return MapSupporter(supporter);
    }

    public async Task DeleteDonorAsync(int id)
    {
        var supporter = await db.Supporters.FindAsync(id) ?? throw new KeyNotFoundException("Donor not found.");
        db.Supporters.Remove(supporter);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalContributionDto> AddContributionAsync(int donorId, CreateContributionRequestDto request)
    {
        var supporter = await db.Supporters.FindAsync(donorId) ?? throw new KeyNotFoundException("Donor not found.");
        var donation = new Donation
        {
            SupporterId = donorId,
            DonationType = CleanRequired(request.DonationType, "Monetary"),
            DonationDate = request.ContributionAt,
            IsRecurring = request.IsRecurring,
            CampaignName = NormalizeNullable(request.CampaignName),
            ChannelSource = NormalizeNullable(request.ChannelSource) ?? "AdminPortal",
            CurrencyCode = "PHP",
            Amount = request.AmountPhp,
            EstimatedValue = request.EstimatedValuePhp ?? request.AmountPhp,
            ImpactUnit = request.DonationType.Equals("Time", StringComparison.OrdinalIgnoreCase) ? "hours" : "pesos",
            Notes = CleanRequired(request.Description)
        };

        db.Donations.Add(donation);
        await db.SaveChangesAsync();

        foreach (var allocation in request.Allocations.Where(a => a.AmountAllocated > 0))
        {
            db.DonationAllocations.Add(new DonationAllocation
            {
                DonationId = donation.DonationId,
                SafehouseId = allocation.SafehouseId,
                ProgramArea = CleanRequired(allocation.ProgramArea, request.ProgramArea),
                AmountAllocated = allocation.AmountAllocated,
                AllocationDate = allocation.AllocationDate ?? request.ContributionAt,
                AllocationNotes = NormalizeNullable(allocation.AllocationNotes)
            });
        }

        await db.SaveChangesAsync();
        await db.Entry(donation).Reference(d => d.Supporter).LoadAsync();
        await db.Entry(donation).Collection(d => d.Allocations).LoadAsync();
        return await LoadContributionDtoAsync(donation.DonationId);
    }

    public async Task<AdminPortalContributionDto> UpdateContributionAsync(int id, UpdateContributionRequestDto request)
    {
        var donation = await db.Donations
            .Include(d => d.Allocations)
            .ThenInclude(a => a.Safehouse)
            .Include(d => d.Supporter)
            .FirstOrDefaultAsync(d => d.DonationId == id)
            ?? throw new KeyNotFoundException("Contribution or donor not found.");

        if (await db.Supporters.FindAsync(request.DonorId) is null)
        {
            throw new KeyNotFoundException("Contribution or donor not found.");
        }

        donation.SupporterId = request.DonorId;
        donation.DonationType = CleanRequired(request.DonationType, donation.DonationType);
        donation.DonationDate = request.ContributionAt;
        donation.IsRecurring = request.IsRecurring;
        donation.CampaignName = NormalizeNullable(request.CampaignName);
        donation.ChannelSource = NormalizeNullable(request.ChannelSource) ?? donation.ChannelSource;
        donation.Amount = request.AmountPhp;
        donation.EstimatedValue = request.EstimatedValuePhp ?? request.AmountPhp;
        donation.Notes = CleanRequired(request.Description);

        db.DonationAllocations.RemoveRange(donation.Allocations);
        await db.SaveChangesAsync();

        foreach (var allocation in request.Allocations.Where(a => a.AmountAllocated > 0))
        {
            db.DonationAllocations.Add(new DonationAllocation
            {
                DonationId = donation.DonationId,
                SafehouseId = allocation.SafehouseId,
                ProgramArea = CleanRequired(allocation.ProgramArea, request.ProgramArea),
                AmountAllocated = allocation.AmountAllocated,
                AllocationDate = allocation.AllocationDate ?? request.ContributionAt,
                AllocationNotes = NormalizeNullable(allocation.AllocationNotes)
            });
        }

        await db.SaveChangesAsync();
        await db.Entry(donation).Reference(d => d.Supporter).LoadAsync();
        await db.Entry(donation).Collection(d => d.Allocations).LoadAsync();
        return await LoadContributionDtoAsync(donation.DonationId);
    }

    public async Task DeleteContributionAsync(int id)
    {
        var donation = await db.Donations.FindAsync(id) ?? throw new KeyNotFoundException("Contribution not found.");
        db.Donations.Remove(donation);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalResidentDto> AddResidentAsync(CreateResidentRequestDto request)
    {
        var resident = new Resident();
        await ApplyResidentAsync(resident, request);
        resident.CreatedAt ??= DateTime.UtcNow;
        db.Residents.Add(resident);
        await db.SaveChangesAsync();

        if (resident.DateCaseStudyPrepared is not null || resident.DateEnrolled is not null)
        {
            await UpsertCaseConferencePlanAsync(resident.ResidentId, resident.InitialCaseAssessment, resident.DateCaseStudyPrepared ?? resident.DateEnrolled);
        }

        return await LoadResidentDtoAsync(resident.ResidentId);
    }

    public async Task<AdminPortalResidentDto> UpdateResidentAsync(int id, UpdateResidentRequestDto request)
    {
        var resident = await db.Residents.FindAsync(id) ?? throw new KeyNotFoundException("Resident not found.");
        await ApplyResidentAsync(resident, request);
        await db.SaveChangesAsync();

        if (resident.DateCaseStudyPrepared is not null || resident.DateEnrolled is not null)
        {
            await UpsertCaseConferencePlanAsync(resident.ResidentId, resident.InitialCaseAssessment, resident.DateCaseStudyPrepared ?? resident.DateEnrolled);
        }

        return await LoadResidentDtoAsync(id);
    }

    public async Task DeleteResidentAsync(int id)
    {
        var resident = await db.Residents.FindAsync(id) ?? throw new KeyNotFoundException("Resident not found.");
        db.Residents.Remove(resident);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalRecordingDto> AddRecordingAsync(CreateRecordingRequestDto request)
    {
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Resident not found.");
        }

        var recording = new ProcessRecording();
        ApplyRecording(recording, request);
        db.ProcessRecordings.Add(recording);
        await db.SaveChangesAsync();
        return await LoadRecordingDtoAsync(recording.RecordingId);
    }

    public async Task<AdminPortalRecordingDto> UpdateRecordingAsync(int id, UpdateRecordingRequestDto request)
    {
        var recording = await db.ProcessRecordings.FindAsync(id) ?? throw new KeyNotFoundException("Recording or resident not found.");
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Recording or resident not found.");
        }

        ApplyRecording(recording, request);
        await db.SaveChangesAsync();
        return await LoadRecordingDtoAsync(id);
    }

    public async Task DeleteRecordingAsync(int id)
    {
        var recording = await db.ProcessRecordings.FindAsync(id) ?? throw new KeyNotFoundException("Recording not found.");
        db.ProcessRecordings.Remove(recording);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalVisitationDto> AddVisitationAsync(CreateVisitationRequestDto request)
    {
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Resident not found.");
        }

        var visitation = new HomeVisitation();
        ApplyVisitation(visitation, request);
        db.HomeVisitations.Add(visitation);
        await db.SaveChangesAsync();
        return await LoadVisitationDtoAsync(visitation.VisitationId);
    }

    public async Task<AdminPortalVisitationDto> UpdateVisitationAsync(int id, UpdateVisitationRequestDto request)
    {
        var visitation = await db.HomeVisitations.FindAsync(id) ?? throw new KeyNotFoundException("Visitation or resident not found.");
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Visitation or resident not found.");
        }

        ApplyVisitation(visitation, request);
        await db.SaveChangesAsync();
        return await LoadVisitationDtoAsync(id);
    }

    public async Task DeleteVisitationAsync(int id)
    {
        var visitation = await db.HomeVisitations.FindAsync(id) ?? throw new KeyNotFoundException("Visitation not found.");
        db.HomeVisitations.Remove(visitation);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalConferenceDto> AddConferenceAsync(CreateConferenceRequestDto request)
    {
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Resident not found.");
        }

        var plan = new InterventionPlan();
        ApplyConference(plan, request);
        db.InterventionPlans.Add(plan);
        await db.SaveChangesAsync();
        return await LoadConferenceDtoAsync(plan.PlanId);
    }

    public async Task<AdminPortalConferenceDto> UpdateConferenceAsync(int id, UpdateConferenceRequestDto request)
    {
        var plan = await db.InterventionPlans.FindAsync(id) ?? throw new KeyNotFoundException("Conference plan not found.");
        if (await db.Residents.FindAsync(request.ResidentId) is null)
        {
            throw new KeyNotFoundException("Resident not found.");
        }

        ApplyConference(plan, request);
        await db.SaveChangesAsync();
        return await LoadConferenceDtoAsync(id);
    }

    public async Task DeleteConferenceAsync(int id)
    {
        var plan = await db.InterventionPlans.FindAsync(id) ?? throw new KeyNotFoundException("Conference plan not found.");
        db.InterventionPlans.Remove(plan);
        await db.SaveChangesAsync();
    }

    private async Task BackfillSupportersAndDonationsAsync()
    {
        var portalDonors = await db.PortalDonors
            .AsNoTracking()
            .Include(d => d.Contributions)
            .ToListAsync();

        foreach (var donor in portalDonors)
        {
            var supporter = await db.Supporters.FirstOrDefaultAsync(s =>
                (donor.LinkedEmail != null && s.Email == donor.LinkedEmail) ||
                s.DisplayName == donor.DisplayName);

            if (supporter is null)
            {
                supporter = new Supporter
                {
                    DisplayName = CleanRequired(donor.DisplayName, "Unknown Donor"),
                    Email = NormalizeNullable(donor.LinkedEmail),
                    SupporterType = CleanRequired(donor.DonorType, "Individual"),
                    Status = CleanRequired(donor.Status, "Active"),
                    RelationshipType = "Legacy Portal",
                    Region = "Unspecified",
                    Country = "Philippines",
                    CreatedAt = donor.LastDonationAt ?? DateTime.UtcNow,
                    AcquisitionChannel = CleanRequired(donor.PreferredChannel, "Direct")
                };
                db.Supporters.Add(supporter);
                await db.SaveChangesAsync();
            }

            foreach (var contribution in donor.Contributions)
            {
                var exists = await db.Donations.AnyAsync(d =>
                    d.SupporterId == supporter.SupporterId &&
                    d.DonationDate == contribution.ContributionAt &&
                    d.Notes == contribution.Description &&
                    d.DonationType == contribution.ContributionType);

                if (exists)
                {
                    continue;
                }

                db.Donations.Add(new Donation
                {
                    SupporterId = supporter.SupporterId,
                    DonationType = CleanRequired(contribution.ContributionType, "Monetary"),
                    DonationDate = contribution.ContributionAt,
                    IsRecurring = false,
                    CampaignName = null,
                    ChannelSource = CleanRequired(donor.PreferredChannel, "Legacy Portal"),
                    CurrencyCode = "PHP",
                    Amount = contribution.AmountPhp,
                    EstimatedValue = contribution.EstimatedValuePhp ?? contribution.AmountPhp,
                    ImpactUnit = (contribution.ContributionType ?? "").Equals("Time", StringComparison.OrdinalIgnoreCase) ? "hours" : "pesos",
                    Notes = CleanRequired(contribution.Description, "No description provided")
                });
                await db.SaveChangesAsync();
            }
        }
    }

    private async Task BackfillResidentsAsync()
    {
        var portalResidents = await db.PortalResidents.AsNoTracking().ToListAsync();
        foreach (var portalResident in portalResidents)
        {
            if (await db.Residents.AnyAsync(r => r.InternalCode == portalResident.CodeName))
            {
                continue;
            }

            var safehouseId = await EnsureSafehouseByNameAsync(portalResident.Safehouse ?? "Legacy Safehouse");
            var resident = new Resident
            {
                InternalCode = CleanRequired(portalResident.CodeName, $"LEGACY-{portalResident.Id}"),
                SafehouseId = safehouseId,
                CaseStatus = CleanRequired(portalResident.Status, "Active"),
                Sex = "F",
                CaseCategory = CleanRequired(portalResident.CaseCategory, "General"),
                AssignedSocialWorker = CleanRequired(portalResident.AssignedStaff, "Unassigned"),
                InitialCaseAssessment = "Backfilled from portal resident inventory",
                CurrentRiskLevel = CleanRequired(portalResident.RiskLevel, "Low"),
                InitialRiskLevel = CleanRequired(portalResident.RiskLevel, "Low"),
                ReintegrationStatus = "In Progress",
                DateOfAdmission = portalResident.LastSessionAt?.Date,
                DateEnrolled = portalResident.LastSessionAt?.Date,
                CreatedAt = portalResident.LastSessionAt ?? DateTime.UtcNow
            };

            db.Residents.Add(resident);
            await db.SaveChangesAsync();

            if (portalResident.NextReviewAt is not null)
            {
                await UpsertCaseConferencePlanAsync(resident.ResidentId, "Legacy case review migrated from portal schedule.", portalResident.NextReviewAt.Value);
            }
        }
    }

    private async Task BackfillRecordingsAsync()
    {
        var portalRecordings = await db.PortalRecordings.AsNoTracking().ToListAsync();
        foreach (var recording in portalRecordings)
        {
            var resident = await db.PortalResidents.AsNoTracking().FirstOrDefaultAsync(r => r.Id == recording.ResidentId);
            if (resident is null)
            {
                continue;
            }

            var canonicalResident = await db.Residents.FirstOrDefaultAsync(r => r.InternalCode == resident.CodeName);
            if (canonicalResident is null)
            {
                continue;
            }

            var exists = await db.ProcessRecordings.AnyAsync(r =>
                r.ResidentId == canonicalResident.ResidentId &&
                r.SessionDate == recording.SessionAt &&
                r.SocialWorker == recording.StaffName);

            if (exists)
            {
                continue;
            }

            db.ProcessRecordings.Add(new ProcessRecording
            {
                ResidentId = canonicalResident.ResidentId,
                SessionDate = recording.SessionAt,
                SocialWorker = CleanRequired(recording.StaffName, "Unassigned"),
                SessionType = CleanRequired(recording.SessionType, "Individual"),
                SessionDurationMinutes = 60,
                EmotionalStateObserved = CleanRequired(recording.EmotionalState, "Neutral"),
                EmotionalStateEnd = CleanRequired(recording.EmotionalState, "Neutral"),
                SessionNarrative = CleanRequired(recording.Summary, "No summary provided"),
                InterventionsApplied = CleanRequired(recording.Interventions, "None recorded"),
                FollowUpActions = CleanRequired(recording.FollowUp, "None"),
                ProgressNoted = true,
                ConcernsFlagged = (recording.EmotionalState ?? "").Contains("anx", StringComparison.OrdinalIgnoreCase)
                    || (recording.EmotionalState ?? "").Contains("distress", StringComparison.OrdinalIgnoreCase),
                ReferralMade = (recording.FollowUp ?? "").Contains("referral", StringComparison.OrdinalIgnoreCase)
            });
            await db.SaveChangesAsync();
        }
    }

    private async Task BackfillVisitationsAsync()
    {
        var portalVisitations = await db.PortalVisitations.AsNoTracking().ToListAsync();
        foreach (var visitation in portalVisitations)
        {
            var resident = await db.PortalResidents.AsNoTracking().FirstOrDefaultAsync(r => r.Id == visitation.ResidentId);
            if (resident is null)
            {
                continue;
            }

            var canonicalResident = await db.Residents.FirstOrDefaultAsync(r => r.InternalCode == resident.CodeName);
            if (canonicalResident is null)
            {
                continue;
            }

            var exists = await db.HomeVisitations.AnyAsync(v =>
                v.ResidentId == canonicalResident.ResidentId &&
                v.VisitDate == visitation.VisitAt &&
                v.VisitType == visitation.VisitType);

            if (exists)
            {
                continue;
            }

            db.HomeVisitations.Add(new HomeVisitation
            {
                ResidentId = canonicalResident.ResidentId,
                VisitDate = visitation.VisitAt,
                SocialWorker = canonicalResident.AssignedSocialWorker ?? "Unassigned",
                VisitType = CleanRequired(visitation.VisitType, "Routine follow-up"),
                LocationVisited = canonicalResident.SafehouseId.ToString(),
                FamilyMembersPresent = null,
                Purpose = "Backfilled legacy visitation",
                Observations = CleanRequired(visitation.Observations, "No observations"),
                FamilyCooperationLevel = CleanRequired(visitation.FamilyCooperation, "Unspecified"),
                SafetyConcernsNoted = !string.IsNullOrWhiteSpace(visitation.SafetyConcerns),
                FollowUpNeeded = !string.IsNullOrWhiteSpace(visitation.FollowUp),
                FollowUpNotes = NormalizeNullable(visitation.FollowUp),
                VisitOutcome = "Inconclusive"
            });
            await db.SaveChangesAsync();
        }
    }

    private async Task<int> EnsureSafehouseByNameAsync(string safehouseName)
    {
        var normalizedName = CleanRequired(safehouseName);
        var existing = await db.Safehouses.FirstOrDefaultAsync(s => s.Name == normalizedName);
        if (existing is not null)
        {
            return existing.SafehouseId;
        }

        var safehouse = new Safehouse
        {
            SafehouseCode = $"LEGACY-{await db.Safehouses.CountAsync() + 1:D2}",
            Name = normalizedName,
            Region = "Unspecified",
            City = "Unspecified",
            Province = "Unspecified",
            Country = "Philippines",
            OpenDate = DateTime.UtcNow.Date,
            Status = "Active",
            CapacityGirls = 0,
            CapacityStaff = 0,
            CurrentOccupancy = 0,
            Notes = "Backfilled from legacy portal records."
        };

        db.Safehouses.Add(safehouse);
        await db.SaveChangesAsync();
        return safehouse.SafehouseId;
    }

    private async Task ApplyResidentAsync(Resident resident, CreateResidentRequestDto request)
    {
        if (await db.Safehouses.FindAsync(request.SafehouseId) is null)
        {
            throw new KeyNotFoundException("Safehouse not found.");
        }

        resident.CaseControlNo = NormalizeNullable(request.CaseControlNo);
        resident.InternalCode = CleanRequired(request.CodeName);
        resident.SafehouseId = request.SafehouseId;
        resident.CaseStatus = CleanRequired(request.CaseStatus, "Active");
        resident.Sex = NormalizeNullable(request.Sex) ?? "F";
        resident.DateOfBirth = request.DateOfBirth?.Date;
        resident.BirthStatus = NormalizeNullable(request.BirthStatus);
        resident.PlaceOfBirth = NormalizeNullable(request.PlaceOfBirth);
        resident.Religion = NormalizeNullable(request.Religion);
        resident.CaseCategory = CleanRequired(request.CaseCategory);
        resident.SubCatOrphaned = request.SubCatOrphaned;
        resident.SubCatTrafficked = request.SubCatTrafficked;
        resident.SubCatChildLabor = request.SubCatChildLabor;
        resident.SubCatPhysicalAbuse = request.SubCatPhysicalAbuse;
        resident.SubCatSexualAbuse = request.SubCatSexualAbuse;
        resident.SubCatOsaec = request.SubCatOsaec;
        resident.SubCatCicl = request.SubCatCicl;
        resident.SubCatAtRisk = request.SubCatAtRisk;
        resident.SubCatStreetChild = request.SubCatStreetChild;
        resident.SubCatChildWithHiv = request.SubCatChildWithHiv;
        resident.IsPwd = request.IsPwd;
        resident.PwdType = NormalizeNullable(request.PwdType);
        resident.HasSpecialNeeds = request.HasSpecialNeeds;
        resident.SpecialNeedsDiagnosis = NormalizeNullable(request.SpecialNeedsDiagnosis);
        resident.FamilyIs4Ps = request.FamilyIs4Ps;
        resident.FamilySoloParent = request.FamilySoloParent;
        resident.FamilyIndigenous = request.FamilyIndigenous;
        resident.FamilyParentPwd = request.FamilyParentPwd;
        resident.FamilyInformalSettler = request.FamilyInformalSettler;
        resident.DateOfAdmission = request.DateOfAdmission?.Date;
        resident.AgeUponAdmission = NormalizeNullable(request.AgeUponAdmission);
        resident.PresentAge = NormalizeNullable(request.PresentAge);
        resident.LengthOfStay = NormalizeNullable(request.LengthOfStay);
        resident.ReferralSource = NormalizeNullable(request.ReferralSource);
        resident.ReferringAgencyPerson = NormalizeNullable(request.ReferringAgencyPerson);
        resident.DateColbRegistered = request.DateColbRegistered?.Date;
        resident.DateColbObtained = request.DateColbObtained?.Date;
        resident.AssignedSocialWorker = CleanRequired(request.AssignedStaff);
        resident.InitialCaseAssessment = NormalizeNullable(request.InitialCaseAssessment);
        resident.DateCaseStudyPrepared = request.DateCaseStudyPrepared?.Date;
        resident.ReintegrationType = NormalizeNullable(request.ReintegrationType);
        resident.ReintegrationStatus = NormalizeNullable(request.ReintegrationStatus);
        resident.InitialRiskLevel = NormalizeNullable(request.InitialRiskLevel) ?? CleanRequired(request.RiskLevel, "Low");
        resident.CurrentRiskLevel = CleanRequired(request.RiskLevel, "Low");
        resident.DateEnrolled = request.DateEnrolled?.Date ?? request.DateOfAdmission?.Date;
        resident.DateClosed = request.DateClosed?.Date;
        resident.NotesRestricted = NormalizeNullable(request.NotesRestricted);
    }

    private static void ApplyRecording(ProcessRecording recording, CreateRecordingRequestDto request)
    {
        recording.ResidentId = request.ResidentId;
        recording.SessionDate = request.SessionAt;
        recording.SocialWorker = CleanRequired(request.StaffName);
        recording.SessionType = CleanRequired(request.SessionType, "Individual");
        recording.SessionDurationMinutes = request.SessionDurationMinutes <= 0 ? 60 : request.SessionDurationMinutes;
        recording.EmotionalStateObserved = CleanRequired(request.EmotionalState);
        recording.EmotionalStateEnd = CleanRequired(request.EmotionalStateEnd, request.EmotionalState);
        recording.SessionNarrative = CleanRequired(request.Summary);
        recording.InterventionsApplied = CleanRequired(request.Interventions);
        recording.FollowUpActions = CleanRequired(request.FollowUp);
        recording.ProgressNoted = request.ProgressNoted;
        recording.ConcernsFlagged = request.ConcernsFlagged;
        recording.ReferralMade = request.ReferralMade;
        recording.NotesRestricted = NormalizeNullable(request.NotesRestricted);
    }

    private static void ApplyVisitation(HomeVisitation visitation, CreateVisitationRequestDto request)
    {
        visitation.ResidentId = request.ResidentId;
        visitation.VisitDate = request.VisitAt;
        visitation.SocialWorker = CleanRequired(request.SocialWorker);
        visitation.VisitType = CleanRequired(request.VisitType);
        visitation.LocationVisited = CleanRequired(request.LocationVisited);
        visitation.FamilyMembersPresent = NormalizeNullable(request.FamilyMembersPresent);
        visitation.Purpose = CleanRequired(request.Purpose);
        visitation.Observations = CleanRequired(request.Observations);
        visitation.FamilyCooperationLevel = CleanRequired(request.FamilyCooperation);
        visitation.SafetyConcernsNoted = request.SafetyConcernsNoted;
        visitation.FollowUpNeeded = request.FollowUpNeeded;
        visitation.FollowUpNotes = NormalizeNullable(request.FollowUpNotes);
        visitation.VisitOutcome = CleanRequired(request.VisitOutcome);
    }

    private static void ApplyConference(InterventionPlan plan, CreateConferenceRequestDto request)
    {
        plan.ResidentId = request.ResidentId;
        plan.PlanCategory = CleanRequired(request.PlanCategory, "Psychosocial");
        plan.Status = CleanRequired(request.Status, "In Progress");
        plan.CaseConferenceDate = request.ConferenceDate.Date;
        plan.TargetDate = request.TargetDate?.Date;
        plan.PlanDescription = CleanRequired(request.PlanDescription, "Case conference follow-up plan.");
        plan.ServicesProvided = NormalizeNullable(request.ServicesProvided) ?? "Case Management";
        plan.UpdatedAt = DateTime.UtcNow;
        plan.CreatedAt ??= DateTime.UtcNow;
    }

    private async Task UpsertCaseConferencePlanAsync(int residentId, string? description, DateTime? conferenceDate)
    {
        if (conferenceDate is null)
        {
            return;
        }

        var plan = await db.InterventionPlans
            .FirstOrDefaultAsync(p => p.ResidentId == residentId && p.PlanCategory == "Psychosocial" && p.CaseConferenceDate != null);

        if (plan is null)
        {
            db.InterventionPlans.Add(new InterventionPlan
            {
                ResidentId = residentId,
                PlanCategory = "Psychosocial",
                PlanDescription = NormalizeNullable(description) ?? "Case conference follow-up plan.",
                ServicesProvided = "Case Management",
                Status = "In Progress",
                CaseConferenceDate = conferenceDate.Value.Date,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            plan.CaseConferenceDate = conferenceDate.Value.Date;
            plan.PlanDescription = NormalizeNullable(description) ?? plan.PlanDescription;
            plan.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
    }

    private async Task<AdminPortalResidentDto> LoadResidentDtoAsync(int residentId)
    {
        var resident = await db.Residents
            .AsNoTracking()
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings)
            .Include(r => r.InterventionPlans)
            .FirstAsync(r => r.ResidentId == residentId);
        return MapResident(resident);
    }

    private async Task<AdminPortalRecordingDto> LoadRecordingDtoAsync(int recordingId)
    {
        var recording = await db.ProcessRecordings
            .AsNoTracking()
            .Include(r => r.Resident)
            .FirstAsync(r => r.RecordingId == recordingId);
        return MapRecording(recording);
    }

    private async Task<AdminPortalContributionDto> LoadContributionDtoAsync(int donationId)
    {
        var donation = await db.Donations
            .AsNoTracking()
            .Include(d => d.Supporter)
            .Include(d => d.Allocations)
            .ThenInclude(a => a.Safehouse)
            .FirstAsync(d => d.DonationId == donationId);
        return MapDonation(donation);
    }

    private async Task<AdminPortalVisitationDto> LoadVisitationDtoAsync(int visitationId)
    {
        var visitation = await db.HomeVisitations
            .AsNoTracking()
            .Include(v => v.Resident)
            .FirstAsync(v => v.VisitationId == visitationId);
        return MapVisitation(visitation);
    }

    private async Task<AdminPortalConferenceDto> LoadConferenceDtoAsync(int planId)
    {
        var plan = await db.InterventionPlans
            .AsNoTracking()
            .Include(p => p.Resident!)
            .ThenInclude(r => r.Safehouse)
            .FirstAsync(p => p.PlanId == planId);
        return MapConference(plan);
    }

    private async Task<IReadOnlyList<AdminPortalTrendPointDto>> BuildMonthlyTrendsAsync()
    {
        var monthStarts = Enumerable.Range(0, 6)
            .Select(offset =>
            {
                var date = DateTime.UtcNow.Date.AddMonths(-offset);
                return new DateTime(date.Year, date.Month, 1);
            })
            .Reverse()
            .ToArray();

        var donationLookup = await db.Donations
            .AsNoTracking()
            .Where(d => d.DonationDate >= monthStarts[0])
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(group => new
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1),
                Value = group.Sum(d => d.Amount ?? d.EstimatedValue ?? 0)
            })
            .ToDictionaryAsync(k => k.Month, v => (int)Math.Round(v.Value, MidpointRounding.AwayFromZero));

        var residentLookup = await db.Residents
            .AsNoTracking()
            .Where(r => r.DateEnrolled != null && r.DateEnrolled >= monthStarts[0])
            .GroupBy(r => new { r.DateEnrolled!.Value.Year, r.DateEnrolled!.Value.Month })
            .Select(group => new
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1),
                Value = group.Count()
            })
            .ToDictionaryAsync(k => k.Month, v => v.Value);

        var recordingLookup = await db.ProcessRecordings
            .AsNoTracking()
            .Where(r => r.SessionDate >= monthStarts[0])
            .GroupBy(r => new { r.SessionDate.Year, r.SessionDate.Month })
            .Select(group => new
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1),
                Value = group.Count()
            })
            .ToDictionaryAsync(k => k.Month, v => v.Value);

        var visitationLookup = await db.HomeVisitations
            .AsNoTracking()
            .Where(v => v.VisitDate >= monthStarts[0])
            .GroupBy(v => new { v.VisitDate.Year, v.VisitDate.Month })
            .Select(group => new
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1),
                Value = group.Count()
            })
            .ToDictionaryAsync(k => k.Month, v => v.Value);

        return monthStarts
            .Select(month => new AdminPortalTrendPointDto(
                month.ToString("MMM yyyy"),
                donationLookup.GetValueOrDefault(month),
                residentLookup.GetValueOrDefault(month),
                recordingLookup.GetValueOrDefault(month),
                visitationLookup.GetValueOrDefault(month)))
            .ToArray();
    }

    private async Task<IReadOnlyList<AdminPortalSafehouseComparisonDto>> ReadSafehouseComparisonAsync()
    {
        var residents = await db.Residents.AsNoTracking().ToListAsync();
        var safehouses = await db.Safehouses.AsNoTracking().OrderBy(s => s.Name).ToListAsync();

        return safehouses.Select(safehouse =>
        {
            var safehouseResidents = residents.Where(r => r.SafehouseId == safehouse.SafehouseId).ToArray();
            var activeResidents = safehouseResidents.Count(r => string.Equals(r.CaseStatus, "Active", StringComparison.OrdinalIgnoreCase));
            var highRiskResidents = safehouseResidents.Count(r => string.Equals(r.CurrentRiskLevel, "High", StringComparison.OrdinalIgnoreCase) || string.Equals(r.CurrentRiskLevel, "Critical", StringComparison.OrdinalIgnoreCase));
            var occupancy = safehouse.CurrentOccupancy ?? activeResidents;
            var capacity = safehouse.CapacityGirls ?? Math.Max(activeResidents, occupancy);
            return new AdminPortalSafehouseComparisonDto(safehouse.SafehouseId, safehouse.Name, occupancy, capacity, activeResidents, highRiskResidents);
        }).ToArray();
    }

    private async Task<IReadOnlyList<AdminPortalProgramOutcomeDto>> ReadProgramOutcomesAsync()
    {
        var connection = db.Database.GetDbConnection();
        await db.Database.OpenConnectionAsync();
        try
        {
            var educationProgress = await ExecuteScalarDecimalAsync(connection, "SELECT AVG(progress_percent) FROM education_records;");
            var healthScore = await ExecuteScalarDecimalAsync(connection, "SELECT AVG(general_health_score) FROM health_wellbeing_records;");
            var reintegrationCompleted = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM residents WHERE reintegration_status = 'Completed';");

            return
            [
                new AdminPortalProgramOutcomeDto("Education", "Average progress", $"{educationProgress:N1}%"),
                new AdminPortalProgramOutcomeDto("Health", "Average wellbeing score", $"{healthScore:N1}/5"),
                new AdminPortalProgramOutcomeDto("Reintegration", "Completed cases", reintegrationCompleted.ToString("N0"))
            ];
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private async Task<IReadOnlyList<AdminPortalMlResidentPredictionDto>> ReadReintegrationQueueAsync()
    {
        var connection = db.Database.GetDbConnection();
        await db.Database.OpenConnectionAsync();
        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT TOP 8
                    r.resident_id,
                    r.internal_code,
                    s.name AS safehouse_name,
                    r.case_status,
                    ml.reintegration_readiness_probability,
                    ml.predicted_ready_within_180d,
                    ml.prediction_timestamp,
                    ml.model_name
                FROM ml_resident_reintegration_scores AS ml
                INNER JOIN residents AS r
                    ON r.resident_id = ml.resident_id
                LEFT JOIN safehouses AS s
                    ON s.safehouse_id = r.safehouse_id
                ORDER BY ml.reintegration_readiness_probability DESC, ml.prediction_timestamp DESC;
                """;

            await using var reader = await command.ExecuteReaderAsync();
            var rows = new List<AdminPortalMlResidentPredictionDto>();
            while (await reader.ReadAsync())
            {
                rows.Add(new AdminPortalMlResidentPredictionDto(
                    reader.GetInt32(reader.GetOrdinal("resident_id")),
                    reader.GetString(reader.GetOrdinal("internal_code")),
                    reader.IsDBNull(reader.GetOrdinal("safehouse_name")) ? "Unknown" : reader.GetString(reader.GetOrdinal("safehouse_name")),
                    reader.GetString(reader.GetOrdinal("case_status")),
                    reader.GetDecimal(reader.GetOrdinal("reintegration_readiness_probability")),
                    reader.GetBoolean(reader.GetOrdinal("predicted_ready_within_180d")),
                    reader.IsDBNull(reader.GetOrdinal("prediction_timestamp")) ? null : reader.GetDateTime(reader.GetOrdinal("prediction_timestamp")),
                    reader.IsDBNull(reader.GetOrdinal("model_name")) ? "Unknown" : reader.GetString(reader.GetOrdinal("model_name"))));
            }

            return rows;
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private async Task<IReadOnlyList<AdminPortalConferenceDto>> ReadConferenceScheduleAsync()
    {
        var plans = await db.InterventionPlans
            .AsNoTracking()
            .Include(plan => plan.Resident!)
            .ThenInclude(resident => resident.Safehouse)
            .Where(plan => plan.CaseConferenceDate != null)
            .OrderBy(plan => plan.CaseConferenceDate)
            .Take(12)
            .ToListAsync();

        return plans.Select(MapConference).ToList();
    }

    private async Task<IReadOnlyList<AdminPortalSocialPerformanceDto>> ReadSocialPerformanceAsync()
    {
        // Fetch posts into memory to perform complex grouping/aggregates that EF cannot translate to SQL
        var posts = await db.SocialMediaPosts
            .AsNoTracking()
            .ToListAsync();

        return posts
            .GroupBy(post => post.Platform)
            .Select(group => new AdminPortalSocialPerformanceDto(
                group.Key,
                group.Count(),
                group.Sum(post => post.Reach ?? 0),
                group.Sum(post => post.DonationReferrals ?? 0),
                group.Sum(post => post.EstimatedDonationValuePhp ?? 0),
                group.Any() ? (decimal)group.Average(post => post.EngagementRate ?? 0) : 0m))
            .OrderByDescending(row => row.EstimatedDonationValuePhp)
            .ToList();
    }

    public async Task<IReadOnlyList<AdminPortalSocialPostDto>> GetSocialPostsAsync(string? platform = null, string? campaign = null)
    {
        var query = db.SocialMediaPosts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(platform))
        {
            query = query.Where(post => post.Platform == platform.Trim());
        }

        if (!string.IsNullOrWhiteSpace(campaign))
        {
            query = query.Where(post => post.CampaignName == campaign.Trim());
        }

        return await query
            .OrderByDescending(post => post.CreatedAt ?? DateTime.MinValue)
            .Take(100)
            .Select(post => new AdminPortalSocialPostDto(
                post.PostId,
                post.Platform,
                post.PlatformPostId,
                post.PostUrl,
                post.CreatedAt,
                post.PostType,
                post.ContentTopic,
                post.SentimentTone,
                post.HasCallToAction ?? false,
                post.CampaignName,
                post.Impressions ?? 0,
                post.Reach ?? 0,
                post.Likes ?? 0,
                post.Comments ?? 0,
                post.Shares ?? 0,
                post.ClickThroughs ?? 0,
                post.EngagementRate ?? 0,
                post.DonationReferrals ?? 0,
                post.EstimatedDonationValuePhp ?? 0))
            .ToListAsync();
    }

    private static AdminPortalDashboardDto BuildDashboard(
        IReadOnlyList<AdminPortalResidentDto> residents,
        IReadOnlyList<AdminPortalDonorDto> donors,
        IReadOnlyList<AdminPortalContributionDto> contributions,
        IReadOnlyList<AdminPortalRecordingDto> recordings,
        IReadOnlyList<AdminPortalVisitationDto> visitations,
        IReadOnlyList<AdminPortalConferenceDto> conferences)
    {
        var activeResidents = residents.Count(r => string.Equals(r.CaseStatus, "Active", StringComparison.OrdinalIgnoreCase));
        var totalDonations = contributions.Sum(c => c.AmountPhp ?? c.EstimatedValuePhp ?? 0);
        var upcomingConferences = conferences.Count(c => c.ConferenceDate.Date >= DateTime.UtcNow.Date);
        var highRiskResidents = residents.Count(r =>
            string.Equals(r.RiskLevel, "High", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(r.RiskLevel, "Critical", StringComparison.OrdinalIgnoreCase));

        var metrics = new[]
        {
            new AdminPortalMetricDto("Active Residents", activeResidents.ToString("N0"), "Residents currently in active casework"),
            new AdminPortalMetricDto("Tracked Donations", $"PHP {totalDonations:N0}", "Canonical donations and allocations"),
            new AdminPortalMetricDto("Upcoming Conferences", upcomingConferences.ToString("N0"), "Scheduled through intervention plans"),
            new AdminPortalMetricDto("High-Risk Cases", highRiskResidents.ToString("N0"), "Residents requiring close review")
        };

        var alerts = new List<AdminPortalAlertDto>();
        if (highRiskResidents > 0)
        {
            alerts.Add(new AdminPortalAlertDto("High", "High-risk residents need review", $"{highRiskResidents:N0} residents are marked High or Critical risk."));
        }

        var overdueConferences = conferences.Count(c => c.ConferenceDate.Date < DateTime.UtcNow.Date);
        if (overdueConferences > 0)
        {
            alerts.Add(new AdminPortalAlertDto("Medium", "Case conferences are overdue", $"{overdueConferences:N0} case conferences are scheduled in the past."));
        }

        var recentActivity = contributions
            .Select(c => new AdminPortalActivityDto(c.ContributionAt, "Donation logged", $"{c.DonorName} contributed to {c.ProgramArea}."))
            .Concat(recordings.Select(r => new AdminPortalActivityDto(r.SessionAt, "Process recording added", $"{r.ResidentName} session recorded by {r.StaffName}.")))
            .Concat(visitations.Select(v => new AdminPortalActivityDto(v.VisitAt, "Home visitation logged", $"{v.ResidentName} visitation outcome: {v.VisitOutcome}.")))
            .OrderByDescending(activity => activity.ActivityAt)
            .Take(10)
            .ToArray();

        return new AdminPortalDashboardDto(metrics, alerts, recentActivity);
    }

    private static AdminPortalDonorDto MapSupporter(Supporter supporter)
    {
        var donationValues = supporter.Donations.Select(d => d.Amount ?? d.EstimatedValue ?? 0).ToArray();
        return new AdminPortalDonorDto(
            supporter.SupporterId,
            supporter.DisplayName,
            supporter.Email,
            supporter.SupporterType,
            supporter.OrganizationName,
            supporter.FirstName,
            supporter.LastName,
            supporter.RelationshipType,
            supporter.Region,
            supporter.Country,
            supporter.Phone,
            supporter.Status,
            donationValues.Sum(),
            supporter.Donations.OrderBy(d => d.DonationDate).Select(d => (DateTime?)d.DonationDate).FirstOrDefault(),
            supporter.Donations.OrderByDescending(d => d.DonationDate).Select(d => (DateTime?)d.DonationDate).FirstOrDefault(),
            supporter.AcquisitionChannel);
    }

    private static AdminPortalContributionDto MapDonation(Donation donation)
    {
        return new AdminPortalContributionDto(
            donation.DonationId,
            donation.SupporterId,
            donation.Supporter?.DisplayName ?? "Unknown supporter",
            donation.DonationType,
            donation.Amount,
            donation.EstimatedValue,
            donation.Allocations.FirstOrDefault()?.ProgramArea ?? donation.ChannelSource ?? "General Support",
            donation.Notes ?? string.Empty,
            donation.ChannelSource,
            donation.CampaignName,
            donation.DonationDate,
            donation.Allocations
                .Select(allocation => new AdminPortalDonationAllocationDto(
                    allocation.AllocationId,
                    allocation.SafehouseId,
                    allocation.Safehouse?.Name,
                    allocation.ProgramArea,
                    allocation.AmountAllocated,
                    allocation.AllocationDate,
                    allocation.AllocationNotes))
                .ToArray());
    }

    private static AdminPortalResidentDto MapResident(Resident resident)
    {
        var latestSession = resident.ProcessRecordings.OrderByDescending(r => r.SessionDate).FirstOrDefault();
        var openPlans = resident.InterventionPlans.Where(plan => !string.Equals(plan.Status, "Closed", StringComparison.OrdinalIgnoreCase)).ToArray();
        var latestConference = openPlans
            .Where(plan => plan.CaseConferenceDate != null)
            .OrderBy(plan => plan.CaseConferenceDate)
            .Select(plan => (DateTime?)plan.CaseConferenceDate)
            .FirstOrDefault();

        return new AdminPortalResidentDto(
            resident.ResidentId,
            resident.CaseControlNo,
            resident.InternalCode,
            resident.SafehouseId,
            resident.Safehouse?.Name ?? "Unknown",
            resident.CaseStatus,
            resident.Sex,
            resident.DateOfBirth,
            resident.BirthStatus,
            resident.PlaceOfBirth,
            resident.Religion,
            resident.CaseCategory,
            resident.SubCatOrphaned ?? false,
            resident.SubCatTrafficked ?? false,
            resident.SubCatChildLabor ?? false,
            resident.SubCatPhysicalAbuse ?? false,
            resident.SubCatSexualAbuse ?? false,
            resident.SubCatOsaec ?? false,
            resident.SubCatCicl ?? false,
            resident.SubCatAtRisk ?? false,
            resident.SubCatStreetChild ?? false,
            resident.SubCatChildWithHiv ?? false,
            resident.IsPwd ?? false,
            resident.PwdType,
            resident.HasSpecialNeeds ?? false,
            resident.SpecialNeedsDiagnosis,
            resident.FamilyIs4Ps ?? false,
            resident.FamilySoloParent ?? false,
            resident.FamilyIndigenous ?? false,
            resident.FamilyParentPwd ?? false,
            resident.FamilyInformalSettler ?? false,
            resident.DateOfAdmission,
            resident.AgeUponAdmission,
            resident.PresentAge,
            resident.LengthOfStay,
            resident.ReferralSource,
            resident.ReferringAgencyPerson,
            resident.DateColbRegistered,
            resident.DateColbObtained,
            resident.AssignedSocialWorker ?? string.Empty,
            resident.InitialCaseAssessment,
            resident.DateCaseStudyPrepared,
            resident.ReintegrationType,
            resident.ReintegrationStatus,
            resident.InitialRiskLevel,
            resident.CurrentRiskLevel ?? "Unknown",
            resident.DateEnrolled,
            resident.DateClosed,
            resident.CreatedAt,
            resident.NotesRestricted,
            CalculateResidentProgress(resident),
            latestSession?.SessionDate,
            latestConference,
            openPlans.Length);
    }

    private static AdminPortalRecordingDto MapRecording(ProcessRecording recording)
    {
        return new AdminPortalRecordingDto(
            recording.RecordingId,
            recording.ResidentId,
            recording.Resident?.InternalCode ?? "Unknown resident",
            recording.SessionDate,
            recording.SocialWorker,
            recording.SessionType,
            recording.SessionDurationMinutes,
            recording.EmotionalStateObserved,
            recording.EmotionalStateEnd,
            recording.SessionNarrative,
            recording.InterventionsApplied,
            recording.FollowUpActions,
            recording.ProgressNoted,
            recording.ConcernsFlagged,
            recording.ReferralMade,
            recording.NotesRestricted);
    }

    private static AdminPortalVisitationDto MapVisitation(HomeVisitation visitation)
    {
        return new AdminPortalVisitationDto(
            visitation.VisitationId,
            visitation.ResidentId,
            visitation.Resident?.InternalCode ?? "Unknown resident",
            visitation.VisitDate,
            visitation.SocialWorker,
            visitation.VisitType,
            visitation.LocationVisited,
            visitation.FamilyMembersPresent,
            visitation.Purpose,
            visitation.Observations,
            visitation.FamilyCooperationLevel,
            visitation.SafetyConcernsNoted,
            visitation.FollowUpNeeded,
            visitation.FollowUpNotes,
            visitation.VisitOutcome);
    }

    private static AdminPortalConferenceDto MapConference(InterventionPlan plan)
    {
        return new AdminPortalConferenceDto(
            plan.PlanId,
            plan.ResidentId,
            plan.Resident?.InternalCode ?? "Unknown",
            plan.Resident?.Safehouse?.Name ?? "Unknown",
            plan.PlanCategory,
            plan.Status,
            plan.CaseConferenceDate ?? plan.TargetDate ?? DateTime.UtcNow.Date,
            plan.TargetDate,
            plan.PlanDescription,
            plan.ServicesProvided);
    }

    private static int CalculateResidentProgress(Resident resident)
    {
        if (resident.ReintegrationStatus is not null && resident.ReintegrationStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase))
        {
            return 100;
        }

        if (resident.InterventionPlans.Count == 0)
        {
            return resident.CaseStatus.Equals("Closed", StringComparison.OrdinalIgnoreCase) ? 100 : 35;
        }

        var achieved = resident.InterventionPlans.Count(plan => string.Equals(plan.Status, "Achieved", StringComparison.OrdinalIgnoreCase));
        return (int)Math.Round((decimal)achieved / resident.InterventionPlans.Count * 100, MidpointRounding.AwayFromZero);
    }

    private static async Task<int> ExecuteScalarIntAsync(DbConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var value = await command.ExecuteScalarAsync();
        return value is null || value is DBNull ? 0 : Convert.ToInt32(value);
    }

    private static async Task<decimal> ExecuteScalarDecimalAsync(DbConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var value = await command.ExecuteScalarAsync();
        return value is null || value is DBNull ? 0m : Convert.ToDecimal(value);
    }

    private static bool IsSelfServiceDonorGift(string? notes)
    {
        return !string.IsNullOrWhiteSpace(notes)
            && notes.Contains("Self-service donor gift", StringComparison.OrdinalIgnoreCase);
    }

    private static decimal? PercentOrNull(int numerator, int denominator)
    {
        if (denominator <= 0)
        {
            return null;
        }

        return Math.Round((decimal)numerator / denominator * 100m, 1, MidpointRounding.AwayFromZero);
    }

    private static string CleanRequired(string? value, string fallback = "")
    {
        var cleaned = value?.Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? fallback : cleaned;
    }

    private static string? NormalizeNullable(string? value)
    {
        var cleaned = value?.Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }
}
