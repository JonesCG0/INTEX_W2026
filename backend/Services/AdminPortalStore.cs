#if false
using System.Data.Common;
using backend.Data;
using backend.Models.AdminPortal;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class AdminPortalStore(AppDbContext db)
{
    public async Task SeedAsync()
    {
        if (await db.PortalDonors.AnyAsync())
        {
            return;
        }

        var donors = new[]
        {
            new PortalDonor
            {
                DisplayName = "Sierra Foundation",
                DonorType = "Institutional",
                Status = "Active",
                TotalGivenPhp = 420000m,
                LastDonationAt = DateTime.UtcNow.AddDays(-5),
                PreferredChannel = "Grant letter",
                StewardshipLead = "A. Cruz"
            },
            new PortalDonor
            {
                DisplayName = "Lena Pascual",
                DonorType = "Individual",
                Status = "Active",
                TotalGivenPhp = 78000m,
                LastDonationAt = DateTime.UtcNow.AddDays(-11),
                PreferredChannel = "Email",
                StewardshipLead = "M. Reyes"
            },
            new PortalDonor
            {
                DisplayName = "Hope Circle",
                DonorType = "Community Group",
                Status = "Active",
                TotalGivenPhp = 102500m,
                LastDonationAt = DateTime.UtcNow.AddDays(-18),
                PreferredChannel = "Events",
                StewardshipLead = "J. Santos"
            },
            new PortalDonor
            {
                DisplayName = "Cedar Partners",
                DonorType = "Corporate",
                Status = "Watch",
                TotalGivenPhp = 25000m,
                LastDonationAt = DateTime.UtcNow.AddDays(-40),
                PreferredChannel = "Phone",
                StewardshipLead = "M. Reyes"
            },
            new PortalDonor
            {
                DisplayName = "Anonymous Gift",
                DonorType = "Individual",
                Status = "Active",
                TotalGivenPhp = 15000m,
                LastDonationAt = DateTime.UtcNow.AddDays(-3),
                PreferredChannel = "Text",
                StewardshipLead = "A. Cruz"
            }
        };

        var residents = new[]
        {
            new PortalResident
            {
                CodeName = "Maya",
                Safehouse = "San Isidro House",
                CaseCategory = "Trafficking recovery",
                RiskLevel = "Medium",
                Status = "Active",
                AssignedStaff = "Grace Torres",
                ProgressPercent = 78,
                LastSessionAt = DateTime.UtcNow.AddDays(-3),
                NextReviewAt = DateTime.UtcNow.AddDays(10)
            },
            new PortalResident
            {
                CodeName = "Ari",
                Safehouse = "San Isidro House",
                CaseCategory = "Physical abuse",
                RiskLevel = "High",
                Status = "Active",
                AssignedStaff = "Grace Torres",
                ProgressPercent = 63,
                LastSessionAt = DateTime.UtcNow.AddDays(-7),
                NextReviewAt = DateTime.UtcNow.AddDays(7)
            },
            new PortalResident
            {
                CodeName = "Noa",
                Safehouse = "Bayanihan Home",
                CaseCategory = "Neglect",
                RiskLevel = "Medium",
                Status = "Active",
                AssignedStaff = "Ella Ramos",
                ProgressPercent = 56,
                LastSessionAt = DateTime.UtcNow.AddDays(-2),
                NextReviewAt = DateTime.UtcNow.AddDays(14)
            },
            new PortalResident
            {
                CodeName = "Lia",
                Safehouse = "Bayanihan Home",
                CaseCategory = "Trafficking recovery",
                RiskLevel = "High",
                Status = "Review",
                AssignedStaff = "Ella Ramos",
                ProgressPercent = 42,
                LastSessionAt = DateTime.UtcNow.AddDays(-10),
                NextReviewAt = DateTime.UtcNow.AddDays(4)
            },
            new PortalResident
            {
                CodeName = "Suri",
                Safehouse = "Nueva Vida House",
                CaseCategory = "Family reunification",
                RiskLevel = "Low",
                Status = "Active",
                AssignedStaff = "Jon Perez",
                ProgressPercent = 84,
                LastSessionAt = DateTime.UtcNow.AddDays(-1),
                NextReviewAt = DateTime.UtcNow.AddDays(21)
            },
            new PortalResident
            {
                CodeName = "Tala",
                Safehouse = "Nueva Vida House",
                CaseCategory = "Medical recovery",
                RiskLevel = "Medium",
                Status = "Stabilizing",
                AssignedStaff = "Jon Perez",
                ProgressPercent = 71,
                LastSessionAt = DateTime.UtcNow.AddDays(-5),
                NextReviewAt = DateTime.UtcNow.AddDays(12)
            }
        };

        db.PortalDonors.AddRange(donors);
        db.PortalResidents.AddRange(residents);
        await db.SaveChangesAsync();

        var contributions = new[]
        {
            new PortalContribution
            {
                DonorId = donors[0].Id,
                ContributionType = "Monetary",
                AmountPhp = 180000m,
                ProgramArea = "Resident care",
                Description = "Quarterly grant for shelter operations",
                ContributionAt = DateTime.UtcNow.AddDays(-4)
            },
            new PortalContribution
            {
                DonorId = donors[1].Id,
                ContributionType = "Monetary",
                AmountPhp = 25000m,
                ProgramArea = "Education support",
                Description = "Monthly recurring gift",
                ContributionAt = DateTime.UtcNow.AddDays(-9)
            },
            new PortalContribution
            {
                DonorId = donors[2].Id,
                ContributionType = "Time",
                EstimatedValuePhp = 12000m,
                ProgramArea = "Outreach",
                Description = "Volunteer event coordination",
                ContributionAt = DateTime.UtcNow.AddDays(-16)
            },
            new PortalContribution
            {
                DonorId = donors[3].Id,
                ContributionType = "In-kind",
                EstimatedValuePhp = 18000m,
                ProgramArea = "Supplies",
                Description = "Generator and pantry items",
                ContributionAt = DateTime.UtcNow.AddDays(-29)
            },
            new PortalContribution
            {
                DonorId = donors[4].Id,
                ContributionType = "Monetary",
                AmountPhp = 15000m,
                ProgramArea = "Emergency response",
                Description = "Anonymous fund for urgent needs",
                ContributionAt = DateTime.UtcNow.AddDays(-2)
            },
            new PortalContribution
            {
                DonorId = donors[2].Id,
                ContributionType = "Social media",
                EstimatedValuePhp = 5000m,
                ProgramArea = "Awareness",
                Description = "Campaign amplification and story sharing",
                ContributionAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        var recordings = new[]
        {
            new PortalRecording
            {
                ResidentId = residents[0].Id,
                SessionAt = DateTime.UtcNow.AddDays(-3),
                StaffName = "Grace Torres",
                SessionType = "Individual",
                EmotionalState = "Calmer",
                Summary = "Processed a difficult family discussion and reinforced grounding tools.",
                Interventions = "Reviewed safety plan and coping worksheet.",
                FollowUp = "Follow up on sleep and food intake."
            },
            new PortalRecording
            {
                ResidentId = residents[1].Id,
                SessionAt = DateTime.UtcNow.AddDays(-7),
                StaffName = "Grace Torres",
                SessionType = "Group",
                EmotionalState = "Anxious",
                Summary = "Joined a peer support circle and contributed to a trust-building exercise.",
                Interventions = "Used reflective listening and peer validation.",
                FollowUp = "Schedule a one-on-one check-in."
            },
            new PortalRecording
            {
                ResidentId = residents[2].Id,
                SessionAt = DateTime.UtcNow.AddDays(-2),
                StaffName = "Ella Ramos",
                SessionType = "Individual",
                EmotionalState = "Hopeful",
                Summary = "Discussed school progress and identity reconstruction after intake.",
                Interventions = "Created weekly learning goals.",
                FollowUp = "Confirm tutor placement."
            },
            new PortalRecording
            {
                ResidentId = residents[3].Id,
                SessionAt = DateTime.UtcNow.AddDays(-10),
                StaffName = "Ella Ramos",
                SessionType = "Individual",
                EmotionalState = "Guarded",
                Summary = "Reviewed relapse triggers and future placement concerns.",
                Interventions = "Updated trauma-informed coping plan.",
                FollowUp = "Coordinate with case conference."
            },
            new PortalRecording
            {
                ResidentId = residents[4].Id,
                SessionAt = DateTime.UtcNow.AddDays(-1),
                StaffName = "Jon Perez",
                SessionType = "Family",
                EmotionalState = "Stabilized",
                Summary = "Discussed reunification readiness and family engagement.",
                Interventions = "Prepared family engagement checklist.",
                FollowUp = "Verify home visit date."
            },
            new PortalRecording
            {
                ResidentId = residents[5].Id,
                SessionAt = DateTime.UtcNow.AddDays(-5),
                StaffName = "Jon Perez",
                SessionType = "Individual",
                EmotionalState = "Improving",
                Summary = "Focused on recovery milestones and medication adherence.",
                Interventions = "Reviewed journal prompts and support network.",
                FollowUp = "Check health score next week."
            }
        };

        var visitations = new[]
        {
            new PortalVisitation
            {
                ResidentId = residents[0].Id,
                VisitAt = DateTime.UtcNow.AddDays(-14),
                VisitType = "Routine follow-up",
                Observations = "Home environment was calm and cooperative.",
                FamilyCooperation = "High",
                SafetyConcerns = "No immediate concerns",
                FollowUp = "Continue weekly contact."
            },
            new PortalVisitation
            {
                ResidentId = residents[3].Id,
                VisitAt = DateTime.UtcNow.AddDays(-8),
                VisitType = "Reintegration assessment",
                Observations = "Family engagement improved compared with prior visit.",
                FamilyCooperation = "Moderate",
                SafetyConcerns = "Transportation planning still needed",
                FollowUp = "Prepare case conference notes."
            },
            new PortalVisitation
            {
                ResidentId = residents[4].Id,
                VisitAt = DateTime.UtcNow.AddDays(-6),
                VisitType = "Post-placement monitoring",
                Observations = "Placement site is stable and safe.",
                FamilyCooperation = "High",
                SafetyConcerns = "None at the moment",
                FollowUp = "Maintain monthly monitoring."
            },
            new PortalVisitation
            {
                ResidentId = residents[5].Id,
                VisitAt = DateTime.UtcNow.AddDays(-4),
                VisitType = "Initial assessment",
                Observations = "Household is supportive but needs follow-up on supplies.",
                FamilyCooperation = "Moderate",
                SafetyConcerns = "Minor privacy concern near entrance",
                FollowUp = "Recheck safety in one week."
            },
            new PortalVisitation
            {
                ResidentId = residents[2].Id,
                VisitAt = DateTime.UtcNow.AddDays(-2),
                VisitType = "Routine follow-up",
                Observations = "School coordination is progressing well.",
                FamilyCooperation = "High",
                SafetyConcerns = "None",
                FollowUp = "Keep current schedule."
            }
        };

        db.PortalContributions.AddRange(contributions);
        db.PortalRecordings.AddRange(recordings);
        db.PortalVisitations.AddRange(visitations);

        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalOverviewDto> GetOverviewAsync()
    {
        var donors = await db.PortalDonors
            .OrderByDescending(d => d.TotalGivenPhp)
            .Select(d => new AdminPortalDonorDto(
                d.Id,
                d.DisplayName,
                d.LinkedEmail,
                d.DonorType,
                d.Status,
                d.TotalGivenPhp,
                d.LastDonationAt,
                d.PreferredChannel,
                d.StewardshipLead))
            .ToArrayAsync();

        var contributions = await db.PortalContributions
            .Include(c => c.Donor)
            .OrderByDescending(c => c.ContributionAt)
            .Select(c => new AdminPortalContributionDto(
                c.Id,
                c.DonorId,
                c.Donor!.DisplayName,
                c.ContributionType,
                c.AmountPhp,
                c.EstimatedValuePhp,
                c.ProgramArea,
                c.Description,
                c.ContributionAt))
            .ToArrayAsync();

        var residents = await db.PortalResidents
            .OrderBy(r => r.CodeName)
            .Select(r => new AdminPortalResidentDto(
                r.Id,
                r.CodeName,
                r.Safehouse,
                r.CaseCategory,
                r.RiskLevel,
                r.Status,
                r.AssignedStaff,
                r.ProgressPercent,
                r.LastSessionAt,
                r.NextReviewAt))
            .ToArrayAsync();

        var recordings = await db.PortalRecordings
            .Include(r => r.Resident)
            .OrderByDescending(r => r.SessionAt)
            .Select(r => new AdminPortalRecordingDto(
                r.Id,
                r.ResidentId,
                r.Resident!.CodeName,
                r.SessionAt,
                r.StaffName,
                r.SessionType,
                r.EmotionalState,
                r.Summary,
                r.Interventions,
                r.FollowUp))
            .ToArrayAsync();

        var visitations = await db.PortalVisitations
            .Include(v => v.Resident)
            .OrderByDescending(v => v.VisitAt)
            .Select(v => new AdminPortalVisitationDto(
                v.Id,
                v.ResidentId,
                v.Resident!.CodeName,
                v.VisitAt,
                v.VisitType,
                v.Observations,
                v.FamilyCooperation,
                v.SafetyConcerns,
                v.FollowUp))
            .ToArrayAsync();

        var monthlyTrends = BuildMonthlyTrends(contributions, residents, recordings, visitations);

        await db.Database.OpenConnectionAsync();

        IReadOnlyList<AdminPortalSafehouseComparisonDto> safehouseComparison;
        IReadOnlyList<AdminPortalProgramOutcomeDto> programOutcomes;
        IReadOnlyList<AdminPortalMlResidentPredictionDto> reintegrationQueue;

        try
        {
            var connection = db.Database.GetDbConnection();
            safehouseComparison = await ReadSafehouseComparisonAsync(connection);
            programOutcomes = await ReadProgramOutcomesAsync(connection);
            reintegrationQueue = await ReadReintegrationQueueAsync(connection);
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }

        return new AdminPortalOverviewDto(
            BuildDashboard(donors, contributions, residents, recordings, visitations),
            donors,
            contributions,
            residents,
            recordings,
            visitations,
            new AdminPortalReportsDto(monthlyTrends, safehouseComparison, programOutcomes, reintegrationQueue),
            DateTimeOffset.UtcNow,
            ["portal_donors", "portal_contributions", "portal_residents", "portal_recordings", "portal_visitations", "safehouses", "residents", "education_records", "health_wellbeing_records", "donations", "ml_resident_reintegration_scores"]
        );
    }

    public async Task<AdminPortalDonorDto> UpdateDonorAsync(int id, UpdateDonorRequestDto request)
    {
        var donor = await db.PortalDonors.FindAsync(id) ?? throw new KeyNotFoundException("Donor not found.");
        var linkedEmail = string.IsNullOrWhiteSpace(request.LinkedEmail) ? null : request.LinkedEmail.Trim();
        if (linkedEmail is not null && await db.PortalDonors.AnyAsync(d => d.LinkedEmail == linkedEmail && d.Id != id))
        {
            throw new InvalidOperationException("A donor profile already exists for that email address.");
        }

        donor.DisplayName = request.DisplayName.Trim();
        donor.LinkedEmail = linkedEmail;
        donor.DonorType = request.DonorType.Trim();
        donor.Status = request.Status.Trim();
        donor.PreferredChannel = request.PreferredChannel.Trim();
        donor.StewardshipLead = request.StewardshipLead.Trim();

        await db.SaveChangesAsync();
        return new AdminPortalDonorDto(donor.Id, donor.DisplayName, donor.LinkedEmail, donor.DonorType, donor.Status, donor.TotalGivenPhp, donor.LastDonationAt, donor.PreferredChannel, donor.StewardshipLead);
    }

    public async Task<AdminPortalDonorDto> AddDonorAsync(CreateDonorRequestDto request)
    {
        var linkedEmail = string.IsNullOrWhiteSpace(request.LinkedEmail) ? null : request.LinkedEmail.Trim();
        if (linkedEmail is not null && await db.PortalDonors.AnyAsync(d => d.LinkedEmail == linkedEmail))
        {
            throw new InvalidOperationException("A donor profile already exists for that email address.");
        }

        var donor = new PortalDonor
        {
            DisplayName = request.DisplayName.Trim(),
            LinkedEmail = linkedEmail,
            DonorType = request.DonorType.Trim(),
            Status = request.Status.Trim(),
            PreferredChannel = request.PreferredChannel.Trim(),
            StewardshipLead = request.StewardshipLead.Trim(),
            TotalGivenPhp = 0m,
            LastDonationAt = null
        };

        db.PortalDonors.Add(donor);
        await db.SaveChangesAsync();

        return new AdminPortalDonorDto(
            donor.Id,
            donor.DisplayName,
            donor.LinkedEmail,
            donor.DonorType,
            donor.Status,
            donor.TotalGivenPhp,
            donor.LastDonationAt,
            donor.PreferredChannel,
            donor.StewardshipLead);
    }

    public async Task DeleteDonorAsync(int id)
    {
        var donor = await db.PortalDonors.FindAsync(id) ?? throw new KeyNotFoundException("Donor not found.");
        db.PortalDonors.Remove(donor);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalContributionDto> AddContributionAsync(int donorId, CreateContributionRequestDto request)
    {
        var donor = await db.PortalDonors.FindAsync(donorId) ?? throw new KeyNotFoundException("Donor not found.");

        var contribution = new PortalContribution
        {
            DonorId = donorId,
            ContributionType = request.ContributionType.Trim(),
            AmountPhp = request.AmountPhp,
            EstimatedValuePhp = request.EstimatedValuePhp,
            ProgramArea = request.ProgramArea.Trim(),
            Description = request.Description.Trim(),
            ContributionAt = request.ContributionAt
        };

        db.PortalContributions.Add(contribution);
        await db.SaveChangesAsync();
        await RecalculateDonorTotalsAsync(donorId);

        return new AdminPortalContributionDto(contribution.Id, donor.Id, donor.DisplayName, contribution.ContributionType, contribution.AmountPhp, contribution.EstimatedValuePhp, contribution.ProgramArea, contribution.Description, contribution.ContributionAt);
    }

    public async Task<AdminPortalContributionDto> UpdateContributionAsync(int id, UpdateContributionRequestDto request)
    {
        var contribution = await db.PortalContributions
            .Include(c => c.Donor)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException("Contribution not found.");

        var originalDonorId = contribution.DonorId;
        var donor = await db.PortalDonors.FindAsync(request.DonorId) ?? throw new KeyNotFoundException("Donor not found.");

        contribution.DonorId = request.DonorId;
        contribution.ContributionType = request.ContributionType.Trim();
        contribution.AmountPhp = request.AmountPhp;
        contribution.EstimatedValuePhp = request.EstimatedValuePhp;
        contribution.ProgramArea = request.ProgramArea.Trim();
        contribution.Description = request.Description.Trim();
        contribution.ContributionAt = request.ContributionAt;

        await db.SaveChangesAsync();
        await RecalculateDonorTotalsAsync(originalDonorId);
        if (originalDonorId != request.DonorId)
        {
            await RecalculateDonorTotalsAsync(request.DonorId);
        }

        return new AdminPortalContributionDto(
            contribution.Id,
            donor.Id,
            donor.DisplayName,
            contribution.ContributionType,
            contribution.AmountPhp,
            contribution.EstimatedValuePhp,
            contribution.ProgramArea,
            contribution.Description,
            contribution.ContributionAt);
    }

    public async Task DeleteContributionAsync(int id)
    {
        var contribution = await db.PortalContributions
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException("Contribution not found.");

        var donorId = contribution.DonorId;
        db.PortalContributions.Remove(contribution);
        await db.SaveChangesAsync();
        await RecalculateDonorTotalsAsync(donorId);
    }

    public async Task<AdminPortalResidentDto> AddResidentAsync(CreateResidentRequestDto request)
    {
        var resident = new PortalResident
        {
            CodeName = request.CodeName.Trim(),
            Safehouse = request.Safehouse.Trim(),
            CaseCategory = request.CaseCategory.Trim(),
            RiskLevel = request.RiskLevel.Trim(),
            Status = request.Status.Trim(),
            AssignedStaff = request.AssignedStaff.Trim(),
            ProgressPercent = request.ProgressPercent,
            NextReviewAt = request.NextReviewAt
        };

        db.PortalResidents.Add(resident);
        await db.SaveChangesAsync();
        return MapResident(resident);
    }

    public async Task<AdminPortalResidentDto> UpdateResidentAsync(int id, UpdateResidentRequestDto request)
    {
        var resident = await db.PortalResidents.FindAsync(id) ?? throw new KeyNotFoundException("Resident not found.");
        resident.CodeName = request.CodeName.Trim();
        resident.Safehouse = request.Safehouse.Trim();
        resident.CaseCategory = request.CaseCategory.Trim();
        resident.RiskLevel = request.RiskLevel.Trim();
        resident.Status = request.Status.Trim();
        resident.AssignedStaff = request.AssignedStaff.Trim();
        resident.ProgressPercent = request.ProgressPercent;
        resident.NextReviewAt = request.NextReviewAt;
        await db.SaveChangesAsync();
        return MapResident(resident);
    }

    public async Task DeleteResidentAsync(int id)
    {
        var resident = await db.PortalResidents.FindAsync(id) ?? throw new KeyNotFoundException("Resident not found.");
        db.PortalResidents.Remove(resident);
        await db.SaveChangesAsync();
    }

    public async Task<AdminPortalRecordingDto> AddRecordingAsync(CreateRecordingRequestDto request)
    {
        var resident = await db.PortalResidents.FindAsync(request.ResidentId) ?? throw new KeyNotFoundException("Resident not found.");
        var recording = new PortalRecording
        {
            ResidentId = request.ResidentId,
            SessionAt = request.SessionAt,
            StaffName = request.StaffName.Trim(),
            SessionType = request.SessionType.Trim(),
            EmotionalState = request.EmotionalState.Trim(),
            Summary = request.Summary.Trim(),
            Interventions = request.Interventions.Trim(),
            FollowUp = request.FollowUp.Trim()
        };

        db.PortalRecordings.Add(recording);
        await db.SaveChangesAsync();
        await RecalculateResidentLastSessionAsync(resident.Id);

        return new AdminPortalRecordingDto(recording.Id, resident.Id, resident.CodeName, recording.SessionAt, recording.StaffName, recording.SessionType, recording.EmotionalState, recording.Summary, recording.Interventions, recording.FollowUp);
    }

    public async Task<AdminPortalRecordingDto> UpdateRecordingAsync(int id, UpdateRecordingRequestDto request)
    {
        var recording = await db.PortalRecordings
            .Include(r => r.Resident)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("Recording not found.");

        var originalResidentId = recording.ResidentId;
        var resident = await db.PortalResidents.FindAsync(request.ResidentId) ?? throw new KeyNotFoundException("Resident not found.");

        recording.ResidentId = request.ResidentId;
        recording.SessionAt = request.SessionAt;
        recording.StaffName = request.StaffName.Trim();
        recording.SessionType = request.SessionType.Trim();
        recording.EmotionalState = request.EmotionalState.Trim();
        recording.Summary = request.Summary.Trim();
        recording.Interventions = request.Interventions.Trim();
        recording.FollowUp = request.FollowUp.Trim();

        await db.SaveChangesAsync();
        await RecalculateResidentLastSessionAsync(originalResidentId);
        if (originalResidentId != request.ResidentId)
        {
            await RecalculateResidentLastSessionAsync(request.ResidentId);
        }

        return new AdminPortalRecordingDto(
            recording.Id,
            resident.Id,
            resident.CodeName,
            recording.SessionAt,
            recording.StaffName,
            recording.SessionType,
            recording.EmotionalState,
            recording.Summary,
            recording.Interventions,
            recording.FollowUp);
    }

    public async Task DeleteRecordingAsync(int id)
    {
        var recording = await db.PortalRecordings
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("Recording not found.");

        var residentId = recording.ResidentId;
        db.PortalRecordings.Remove(recording);
        await db.SaveChangesAsync();
        await RecalculateResidentLastSessionAsync(residentId);
    }

    public async Task<AdminPortalVisitationDto> AddVisitationAsync(CreateVisitationRequestDto request)
    {
        var resident = await db.PortalResidents.FindAsync(request.ResidentId) ?? throw new KeyNotFoundException("Resident not found.");
        var visitation = new PortalVisitation
        {
            ResidentId = request.ResidentId,
            VisitAt = request.VisitAt,
            VisitType = request.VisitType.Trim(),
            Observations = request.Observations.Trim(),
            FamilyCooperation = request.FamilyCooperation.Trim(),
            SafetyConcerns = request.SafetyConcerns.Trim(),
            FollowUp = request.FollowUp.Trim()
        };

        db.PortalVisitations.Add(visitation);
        await db.SaveChangesAsync();

        return new AdminPortalVisitationDto(visitation.Id, resident.Id, resident.CodeName, visitation.VisitAt, visitation.VisitType, visitation.Observations, visitation.FamilyCooperation, visitation.SafetyConcerns, visitation.FollowUp);
    }

    public async Task<AdminPortalVisitationDto> UpdateVisitationAsync(int id, UpdateVisitationRequestDto request)
    {
        var visitation = await db.PortalVisitations
            .Include(v => v.Resident)
            .FirstOrDefaultAsync(v => v.Id == id)
            ?? throw new KeyNotFoundException("Visitation not found.");

        var resident = await db.PortalResidents.FindAsync(request.ResidentId) ?? throw new KeyNotFoundException("Resident not found.");

        visitation.ResidentId = request.ResidentId;
        visitation.VisitAt = request.VisitAt;
        visitation.VisitType = request.VisitType.Trim();
        visitation.Observations = request.Observations.Trim();
        visitation.FamilyCooperation = request.FamilyCooperation.Trim();
        visitation.SafetyConcerns = request.SafetyConcerns.Trim();
        visitation.FollowUp = request.FollowUp.Trim();

        await db.SaveChangesAsync();

        return new AdminPortalVisitationDto(visitation.Id, resident.Id, resident.CodeName, visitation.VisitAt, visitation.VisitType, visitation.Observations, visitation.FamilyCooperation, visitation.SafetyConcerns, visitation.FollowUp);
    }

    public async Task DeleteVisitationAsync(int id)
    {
        var visitation = await db.PortalVisitations.FirstOrDefaultAsync(v => v.Id == id) ?? throw new KeyNotFoundException("Visitation not found.");
        db.PortalVisitations.Remove(visitation);
        await db.SaveChangesAsync();
    }

    private static AdminPortalDashboardDto BuildDashboard(
        IReadOnlyList<AdminPortalDonorDto> donors,
        IReadOnlyList<AdminPortalContributionDto> contributions,
        IReadOnlyList<AdminPortalResidentDto> residents,
        IReadOnlyList<AdminPortalRecordingDto> recordings,
        IReadOnlyList<AdminPortalVisitationDto> visitations)
    {
        var activeResidents = residents.Count(resident => resident.Status.Equals("Active", StringComparison.OrdinalIgnoreCase));
        var residentsNeedingReview = residents.Count(resident =>
            resident.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase) ||
            (resident.NextReviewAt is not null && resident.NextReviewAt <= DateTime.UtcNow.AddDays(7)));
        var recentDonations = contributions.Count(contribution => contribution.ContributionAt >= DateTime.UtcNow.AddDays(-30));
        var upcomingConferences = residents.Count(resident =>
            resident.NextReviewAt is not null &&
            resident.NextReviewAt >= DateTime.UtcNow.Date &&
            resident.NextReviewAt <= DateTime.UtcNow.AddDays(30));
        var totalDonationValue = contributions.Sum(contribution => contribution.AmountPhp ?? contribution.EstimatedValuePhp ?? 0m);
        var averageProgress = residents.Count == 0 ? 0 : residents.Average(resident => resident.ProgressPercent);

        var metrics = new[]
        {
            new AdminPortalMetricDto("Active residents", activeResidents.ToString("N0"), "Residents currently marked active in the portal"),
            new AdminPortalMetricDto("Needs review", residentsNeedingReview.ToString("N0"), "High-risk or soon-due cases flagged for follow-up"),
            new AdminPortalMetricDto("Recent donations", recentDonations.ToString("N0"), "Donation and contribution activity from the last 30 days"),
            new AdminPortalMetricDto("Upcoming conferences", upcomingConferences.ToString("N0"), "Scheduled case reviews in the next 30 days"),
            new AdminPortalMetricDto("Donation value", $"PHP {totalDonationValue:N0}", "Combined monetary and estimated contribution value"),
            new AdminPortalMetricDto("Average progress", $"{Math.Round(averageProgress)}%", "Average resident progress across the active caseload")
        };

        var alerts = residents
            .Where(resident => resident.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase) || resident.ProgressPercent < 50)
            .OrderBy(resident => resident.NextReviewAt ?? DateTime.MaxValue)
            .Take(4)
            .Select(resident => new AdminPortalAlertDto(
                resident.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase) ? "warning" : "info",
                $"{resident.CodeName} needs follow-up",
                $"{resident.Safehouse} - {resident.AssignedStaff} - progress {resident.ProgressPercent}%"
            ))
            .ToArray();

        var recentActivity = contributions.Select(contribution => new AdminPortalActivityDto(
                contribution.ContributionAt,
                $"{contribution.DonorName} logged a {contribution.ContributionType.ToLowerInvariant()} contribution",
                $"{contribution.ProgramArea}: {contribution.Description}"
            ))
            .Concat(recordings.Select(recording => new AdminPortalActivityDto(
                recording.SessionAt,
                $"{recording.ResidentName} session updated",
                $"{recording.SessionType} with {recording.StaffName}"
            )))
            .Concat(visitations.Select(visitation => new AdminPortalActivityDto(
                visitation.VisitAt,
                $"{visitation.ResidentName} visit recorded",
                visitation.VisitType
            )))
            .OrderByDescending(activity => activity.ActivityAt)
            .Take(6)
            .ToArray();

        return new AdminPortalDashboardDto(metrics, alerts, recentActivity);
    }

    private static IReadOnlyList<AdminPortalTrendPointDto> BuildMonthlyTrends(
        IReadOnlyList<AdminPortalContributionDto> contributions,
        IReadOnlyList<AdminPortalResidentDto> residents,
        IReadOnlyList<AdminPortalRecordingDto> recordings,
        IReadOnlyList<AdminPortalVisitationDto> visitations)
    {
        return contributions
            .GroupBy(contribution => new DateTime(contribution.ContributionAt.Year, contribution.ContributionAt.Month, 1))
            .OrderBy(group => group.Key)
            .Select(group => new AdminPortalTrendPointDto(
                group.Key.ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture),
                (int)group.Sum(item => item.AmountPhp ?? item.EstimatedValuePhp ?? 0m),
                residents.Count,
                recordings.Count(item => item.SessionAt.Month == group.Key.Month && item.SessionAt.Year == group.Key.Year),
                visitations.Count(item => item.VisitAt.Month == group.Key.Month && item.VisitAt.Year == group.Key.Year)))
            .ToArray();
    }

    private static async Task<IReadOnlyList<AdminPortalSafehouseComparisonDto>> ReadSafehouseComparisonAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                s.name,
                COALESCE(s.current_occupancy, 0) AS occupancy,
                COALESCE(s.capacity_girls, 0) AS capacity,
                COALESCE(active_residents.active_count, 0) AS active_residents,
                COALESCE(high_risk.high_count, 0) AS high_risk_residents
            FROM safehouses AS s
            LEFT JOIN (
                SELECT safehouse_id, COUNT(*) AS active_count
                FROM residents
                WHERE case_status = 'Active'
                GROUP BY safehouse_id
            ) AS active_residents
                ON active_residents.safehouse_id = s.safehouse_id
            LEFT JOIN (
                SELECT safehouse_id, COUNT(*) AS high_count
                FROM residents
                WHERE case_status = 'Active'
                  AND current_risk_level IN ('High', 'Critical')
                GROUP BY safehouse_id
            ) AS high_risk
                ON high_risk.safehouse_id = s.safehouse_id
            ORDER BY s.name;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var comparisons = new List<AdminPortalSafehouseComparisonDto>();

        while (await reader.ReadAsync())
        {
            comparisons.Add(new AdminPortalSafehouseComparisonDto(
                reader.GetString(reader.GetOrdinal("name")),
                reader.GetInt32(reader.GetOrdinal("occupancy")),
                reader.GetInt32(reader.GetOrdinal("capacity")),
                reader.GetInt32(reader.GetOrdinal("active_residents")),
                reader.GetInt32(reader.GetOrdinal("high_risk_residents"))
            ));
        }

        return comparisons;
    }

    private static async Task<IReadOnlyList<AdminPortalProgramOutcomeDto>> ReadProgramOutcomesAsync(DbConnection connection)
    {
        var avgEducationProgress = await ExecuteScalarDecimalAsync(connection, """
            WITH latest_education AS (
                SELECT resident_id, MAX(record_date) AS latest_record_date
                FROM education_records
                GROUP BY resident_id
            )
            SELECT COALESCE(AVG(CAST(e.progress_percent AS decimal(10,2))), 0)
            FROM education_records e
            INNER JOIN latest_education latest
                ON latest.resident_id = e.resident_id
               AND latest.latest_record_date = e.record_date;
            """);

        var avgHealthScore = await ExecuteScalarDecimalAsync(connection, """
            WITH latest_health AS (
                SELECT resident_id, MAX(record_date) AS latest_record_date
                FROM health_wellbeing_records
                GROUP BY resident_id
            )
            SELECT COALESCE(AVG(CAST(h.general_health_score AS decimal(10,2))), 0)
            FROM health_wellbeing_records h
            INNER JOIN latest_health latest
                ON latest.resident_id = h.resident_id
               AND latest.latest_record_date = h.record_date;
            """);

        var reintegrationInProgress = await ExecuteScalarIntAsync(connection, """
            SELECT COUNT(*)
            FROM residents
            WHERE reintegration_status IN ('In Progress', 'Completed');
            """);

        var repeatDonorsLast90Days = await ExecuteScalarIntAsync(connection, """
            WITH recent_donors AS (
                SELECT supporter_id
                FROM donations
                WHERE donation_date >= DATEADD(day, -90, CAST(GETUTCDATE() AS date))
                GROUP BY supporter_id
                HAVING COUNT(*) >= 2
            )
            SELECT COUNT(*) FROM recent_donors;
            """);

        return
        [
            new AdminPortalProgramOutcomeDto("Education", "Average latest resident progress", $"{Math.Round(avgEducationProgress)}%"),
            new AdminPortalProgramOutcomeDto("Health", "Average latest health score", $"{avgHealthScore:N1}/5"),
            new AdminPortalProgramOutcomeDto("Reintegration", "Residents with reintegration underway or complete", reintegrationInProgress.ToString("N0")),
            new AdminPortalProgramOutcomeDto("Donor retention", "Supporters with 2+ donations in the last 90 days", repeatDonorsLast90Days.ToString("N0"))
        ];
    }

    private static async Task<IReadOnlyList<AdminPortalMlResidentPredictionDto>> ReadReintegrationQueueAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT TOP 5
                score.resident_id,
                COALESCE(r.internal_code, CONCAT('Resident-', score.resident_id)) AS resident_code,
                COALESCE(s.name, 'Unassigned') AS safehouse_name,
                score.case_status,
                score.reintegration_readiness_probability,
                score.predicted_ready_within_180d,
                score.prediction_timestamp,
                score.model_name
            FROM ml_resident_reintegration_scores AS score
            LEFT JOIN residents AS r
                ON r.resident_id = score.resident_id
            LEFT JOIN safehouses AS s
                ON s.safehouse_id = r.safehouse_id
            ORDER BY score.reintegration_readiness_probability DESC, score.prediction_timestamp DESC;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var queue = new List<AdminPortalMlResidentPredictionDto>();

        while (await reader.ReadAsync())
        {
            queue.Add(new AdminPortalMlResidentPredictionDto(
                reader.GetInt32(reader.GetOrdinal("resident_id")),
                reader.GetString(reader.GetOrdinal("resident_code")),
                reader.GetString(reader.GetOrdinal("safehouse_name")),
                reader.GetString(reader.GetOrdinal("case_status")),
                reader.GetDecimal(reader.GetOrdinal("reintegration_readiness_probability")),
                reader.GetBoolean(reader.GetOrdinal("predicted_ready_within_180d")),
                reader.IsDBNull(reader.GetOrdinal("prediction_timestamp"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("prediction_timestamp")),
                reader.IsDBNull(reader.GetOrdinal("model_name"))
                    ? "Unknown"
                    : reader.GetString(reader.GetOrdinal("model_name"))
            ));
        }

        return queue;
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
        return value is null || value is DBNull ? 0 : Convert.ToDecimal(value);
    }

    private async Task RecalculateDonorTotalsAsync(int donorId)
    {
        var donor = await db.PortalDonors
            .Include(d => d.Contributions)
            .FirstOrDefaultAsync(d => d.Id == donorId)
            ?? throw new KeyNotFoundException("Donor not found.");

        donor.TotalGivenPhp = donor.Contributions.Sum(contribution => contribution.AmountPhp ?? contribution.EstimatedValuePhp ?? 0m);
        donor.LastDonationAt = donor.Contributions.Count == 0
            ? null
            : donor.Contributions.Max(contribution => contribution.ContributionAt);

        await db.SaveChangesAsync();
    }

    private async Task RecalculateResidentLastSessionAsync(int residentId)
    {
        var resident = await db.PortalResidents
            .Include(r => r.Recordings)
            .FirstOrDefaultAsync(r => r.Id == residentId)
            ?? throw new KeyNotFoundException("Resident not found.");

        resident.LastSessionAt = resident.Recordings.Count == 0
            ? null
            : resident.Recordings.Max(recording => recording.SessionAt);

        await db.SaveChangesAsync();
    }

    private static AdminPortalResidentDto MapResident(PortalResident resident)
    {
        return new AdminPortalResidentDto(
            resident.Id,
            resident.CodeName,
            resident.Safehouse,
            resident.CaseCategory,
            resident.RiskLevel,
            resident.Status,
            resident.AssignedStaff,
            resident.ProgressPercent,
            resident.LastSessionAt,
            resident.NextReviewAt
        );
    }
}
#endif

namespace backend.Services;

public sealed class AdminPortalStore(CanonicalAdminPortalStore canonicalStore)
{
    public Task SeedAsync() => canonicalStore.SeedAsync();
}
