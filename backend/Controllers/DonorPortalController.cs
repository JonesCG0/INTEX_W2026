using System.Security.Claims;
using backend.Data;
using backend.Models.AdminPortal;
using backend.Models.DonorPortal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize(Roles = "Donor")]
[ApiController]
[Route("api/[controller]")]
public sealed class DonorPortalController(AppDbContext db) : ControllerBase
{
    [HttpPost("donate")]
    public async Task<ActionResult<CreateDonationResponseDto>> Donate([FromBody] CreateDonationRequestDto request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        if (User.IsInRole("Admin"))
        {
            return Forbid("Administrators are not permitted to record donor gifts here.");
        }

        var donationAt = request.ContributionAt ?? DateTime.UtcNow;
        var donor = await GetOrCreateDonorProfileAsync(email, User.FindFirstValue("DisplayName") ?? email);
        var amount = Math.Round(request.AmountPhp, 2, MidpointRounding.AwayFromZero);
        var contribution = new PortalContribution
        {
            DonorId = donor.Id,
            ContributionType = "Monetary",
            AmountPhp = amount,
            EstimatedValuePhp = amount,
            ProgramArea = string.IsNullOrWhiteSpace(request.ProgramArea) ? "General Support" : request.ProgramArea.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Notes) ? "Self-service donor gift" : request.Notes.Trim(),
            ContributionAt = donationAt
        };

        donor.TotalGivenPhp += amount;
        donor.LastDonationAt = donationAt;

        db.PortalContributions.Add(contribution);
        await db.SaveChangesAsync();

        return Ok(new CreateDonationResponseDto(
            contribution.Id,
            amount,
            donor.TotalGivenPhp,
            donor.Contributions.Count + 1,
            contribution.ContributionAt
        ));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DonorDashboardDto>> GetDashboard()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        // [IS414] Explicitly deny Admins from viewing the Donor Dashboard to ensure separation of concerns
        if (User.IsInRole("Admin"))
        {
            return Forbid("Administrators are not permitted to view the donor dashboard.");
        }

        var donor = await GetOrCreateDonorProfileAsync(email, User.FindFirstValue("DisplayName") ?? email);

        var contributions = donor.Contributions
            .OrderByDescending(c => c.ContributionAt)
            .Select(c => new DonorContributionDto(
                c.Id,
                c.ContributionType,
                c.AmountPhp,
                c.ProgramArea,
                c.Description,
                c.ContributionAt
            ))
            .ToList();

        var dashboard = new DonorDashboardDto(
            donor.DisplayName,
            donor.TotalGivenPhp,
            donor.Contributions.Count,
            donor.LastDonationAt,
            contributions,
            GetMockSafehouseUpdates(),
            GetImpactMetrics(donor)
        );

        return Ok(dashboard);
    }

    private async Task<PortalDonor> GetOrCreateDonorProfileAsync(string email, string displayName)
    {
        var donor = await db.PortalDonors
            .Include(d => d.Contributions)
            .FirstOrDefaultAsync(d => d.LinkedEmail == email);

        if (donor is not null)
        {
            return donor;
        }

        donor = new PortalDonor
        {
            DisplayName = displayName,
            LinkedEmail = email,
            DonorType = "Individual",
            Status = "Active",
            TotalGivenPhp = 0m,
            PreferredChannel = "Website",
            StewardshipLead = "Unassigned"
        };

        db.PortalDonors.Add(donor);
        await db.SaveChangesAsync();

        return donor;
    }

    private static List<SafehouseUpdateDto> GetMockSafehouseUpdates()
    {
        return [
            new SafehouseUpdateDto(
                "Grace Home", 
                "New Educational Center Complete", 
                "Thanks to our generous supporters, the multimedia room is now fully operational for the residents.", 
                DateTime.UtcNow.AddDays(-2)
            ),
            new SafehouseUpdateDto(
                "Hope Sanctuary", 
                "Vocational Training Success", 
                "Three residents have successfully transitioned to full-time employment this month.", 
                DateTime.UtcNow.AddDays(-5)
            )
        ];
    }

    private static List<ImpactMetricDto> GetImpactMetrics(backend.Models.AdminPortal.PortalDonor donor)
    {
        return [
            new ImpactMetricDto("Safehouses Supported", "4", "IconHome"),
            new ImpactMetricDto("Lives Impacted", "12", "IconUsers"),
            new ImpactMetricDto("Stewardship Tier", donor.TotalGivenPhp > 1000000 ? "Platinum" : "Gold", "IconShieldCheck")
        ];
    }
}
