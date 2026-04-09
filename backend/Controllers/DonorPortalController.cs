using System.Data.Common;
using System.Security.Claims;
using backend.Data;
using backend.Models.Canonical;
using backend.Models.DonorPortal;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize(Roles = "Donor")]
[ApiController]
[Route("api/[controller]")]
public sealed class DonorPortalController(AppDbContext db, SupporterProfileService supporterProfiles) : ControllerBase
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
        var contribution = new Donation
        {
            SupporterId = donor.SupporterId,
            DonationType = "Monetary",
            DonationDate = donationAt,
            IsRecurring = false,
            CampaignName = null,
            ChannelSource = string.IsNullOrWhiteSpace(request.ProgramArea) ? "General Support" : request.ProgramArea.Trim(),
            CurrencyCode = "PHP",
            Amount = amount,
            EstimatedValue = amount,
            ImpactUnit = "pesos",
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? "Self-service donor gift" : request.Notes.Trim()
        };

        db.Donations.Add(contribution);
        await db.SaveChangesAsync();

        await db.Entry(donor).Collection(d => d.Donations).LoadAsync();

        return Ok(new CreateDonationResponseDto(
            contribution.DonationId,
            amount,
            donor.Donations.Sum(d => d.Amount ?? d.EstimatedValue ?? 0),
            donor.Donations.Count,
            contribution.DonationDate
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

        var contributions = donor.Donations
            .OrderByDescending(c => c.DonationDate)
            .Select(c => new DonorContributionDto(
                c.DonationId,
                c.DonationType,
                c.Amount,
                c.ChannelSource ?? "General Support",
                c.Notes ?? string.Empty,
                c.DonationDate
            ))
            .ToList();

        await db.Database.OpenConnectionAsync();

        try
        {
            var connection = db.Database.GetDbConnection();
            var dashboard = new DonorDashboardDto(
                donor.DisplayName,
                donor.Donations.Sum(d => d.Amount ?? d.EstimatedValue ?? 0),
                donor.Donations.Count,
                donor.Donations.OrderByDescending(d => d.DonationDate).Select(d => (DateTime?)d.DonationDate).FirstOrDefault(),
                contributions,
                await ReadSafehouseUpdatesAsync(connection),
                await ReadImpactMetricsAsync(connection, donor),
                DateTimeOffset.UtcNow,
                ["supporters", "donations", "safehouses", "safehouse_monthly_metrics", "residents"]
            );

            return Ok(dashboard);
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private async Task<Supporter> GetOrCreateDonorProfileAsync(string email, string displayName)
    {
        return await supporterProfiles.EnsureSupporterProfileAsync(email, displayName, acquisitionChannel: "Website");
    }

    private static async Task<List<SafehouseUpdateDto>> ReadSafehouseUpdatesAsync(DbConnection connection)
    {
        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT TOP 2
                    s.name,
                    sm.month_start,
                    sm.active_residents,
                    sm.avg_education_progress,
                    sm.avg_health_score
                FROM safehouses AS s
                INNER JOIN (
                    SELECT m.safehouse_id, m.month_start, m.active_residents, m.avg_education_progress, m.avg_health_score
                    FROM safehouse_monthly_metrics m
                    INNER JOIN (
                        SELECT safehouse_id, MAX(month_start) AS latest_month
                        FROM safehouse_monthly_metrics
                        GROUP BY safehouse_id
                    ) latest
                        ON latest.safehouse_id = m.safehouse_id
                       AND latest.latest_month = m.month_start
                ) sm
                    ON sm.safehouse_id = s.safehouse_id
                ORDER BY sm.month_start DESC, sm.avg_education_progress DESC, sm.avg_health_score DESC;
                """;

            await using var reader = await command.ExecuteReaderAsync();
            var updates = new List<SafehouseUpdateDto>();

            while (await reader.ReadAsync())
            {
                var monthStart = reader.GetDateTime(reader.GetOrdinal("month_start"));
                var activeResidents = reader.IsDBNull(reader.GetOrdinal("active_residents"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("active_residents"));
                var avgEducationProgress = reader.IsDBNull(reader.GetOrdinal("avg_education_progress"))
                    ? 0m
                    : reader.GetDecimal(reader.GetOrdinal("avg_education_progress"));
                var avgHealthScore = reader.IsDBNull(reader.GetOrdinal("avg_health_score"))
                    ? 0m
                    : reader.GetDecimal(reader.GetOrdinal("avg_health_score"));

                updates.Add(new SafehouseUpdateDto(
                    reader.GetString(reader.GetOrdinal("name")),
                    $"Latest care snapshot for {monthStart:MMM yyyy}",
                    $"Active residents: {activeResidents:N0}. Average education progress: {Math.Round(avgEducationProgress)}%. Average health score: {avgHealthScore:N1}/5.",
                    monthStart
                ));
            }

            return updates;
        }
        catch (DbException)
        {
            // Fallback: Return empty list if metrics table is missing or unreachable
            return new List<SafehouseUpdateDto>();
        }
    }

    private static async Task<List<ImpactMetricDto>> ReadImpactMetricsAsync(DbConnection connection, Supporter donor)
    {
        var safehouses = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM safehouses WHERE status = 'Active';");
        var activeResidents = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM residents WHERE case_status = 'Active';");
        var donorTotal = donor.Donations.Sum(d => d.Amount ?? d.EstimatedValue ?? 0);
        var donorTier = donorTotal switch
        {
            >= 1000000m => "Platinum",
            >= 250000m => "Gold",
            >= 50000m => "Silver",
            _ => "Supporter"
        };

        return
        [
            new ImpactMetricDto("Safehouses Supported", safehouses.ToString("N0"), "IconHome"),
            new ImpactMetricDto("Residents Served", activeResidents.ToString("N0"), "IconUsers"),
            new ImpactMetricDto("Stewardship Tier", donorTier, "IconShieldCheck")
        ];
    }

    private static async Task<int> ExecuteScalarIntAsync(DbConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var value = await command.ExecuteScalarAsync();
        return value is null || value is DBNull ? 0 : Convert.ToInt32(value);
    }
}
