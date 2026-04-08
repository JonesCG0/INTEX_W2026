using backend.Data;
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
    [HttpGet("dashboard")]
    public async Task<ActionResult<DonorDashboardDto>> GetDashboard()
    {
        var email = User.Identity?.Name;
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        // [IS414] Explicitly deny Admins from viewing the Donor Dashboard to ensure separation of concerns
        if (User.IsInRole("Admin"))
        {
            return Forbid("Administrators are not permitted to view the donor dashboard.");
        }

        var donor = await db.PortalDonors
            .Include(d => d.Contributions)
            .FirstOrDefaultAsync(d => d.LinkedEmail == email);

        if (donor == null)
        {
            return NotFound("Donor profile not found. Please contact support to link your account.");
        }

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
