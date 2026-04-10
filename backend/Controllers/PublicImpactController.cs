using System.Data.Common;
using backend.Data;
using backend.Models.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

// Public (no auth required) endpoint that serves the impact dashboard data.
[ApiController]
[Route("api/public")]
[AllowAnonymous]
public class PublicImpactController(AppDbContext db) : ControllerBase
{
    // GET /api/public/impact — aggregates snapshots, donations, care trends, social stats, and safehouse info.
    [HttpGet("impact")]
    public async Task<ActionResult<ImpactDashboardDto>> GetImpactDashboard()
    {
        try
        {
            var latestSnapshot = await db.PublicImpactSnapshots
                .AsNoTracking()
                .Where(s => s.IsPublished)
                .OrderByDescending(s => s.SnapshotDate)
                .ThenByDescending(s => s.PublishedAt)
                .FirstOrDefaultAsync();

            var publishedSnapshots = await db.PublicImpactSnapshots
                .AsNoTracking()
                .Where(s => s.IsPublished)
                .OrderByDescending(s => s.SnapshotDate)
                .ThenByDescending(s => s.PublishedAt)
                .Take(3)
                .ToListAsync();

            var donationTrendRaw = await db.Donations
                .AsNoTracking()
                .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(d => d.Amount ?? d.EstimatedValue ?? 0) })
                .OrderByDescending(r => r.Year).ThenByDescending(r => r.Month)
                .Take(6)
                .ToListAsync();

            var donationTrend = donationTrendRaw.Select(r => new MonthlyDonationRow(
                new DateTime(r.Year, r.Month, 1),
                r.Total
            )).ToList();

            var careTrendRaw = await db.SafehouseMonthlyMetrics
                .AsNoTracking()
                .Where(m => m.MonthStart != null)
                .GroupBy(m => m.MonthStart)
                .Select(g => new 
                { 
                    MonthStart = g.Key!.Value,
                    Residents = g.Sum(m => m.ActiveResidents ?? 0),
                    Education = g.Average(m => m.AvgEducationProgress ?? 0),
                    Health = g.Average(m => m.AvgHealthScore ?? 0)
                })
                .OrderByDescending(r => r.MonthStart)
                .Take(6)
                .ToListAsync();

            var careTrend = careTrendRaw.Select(r => new MonthlyCareRow(
                r.MonthStart,
                r.Residents,
                r.Education,
                r.Health
            )).ToList();

            var platformPerformance = await db.SocialMediaPosts
                .AsNoTracking()
                .GroupBy(p => p.Platform)
                .Select(g => new
                {
                    Platform = g.Key,
                    Reach = g.Sum(p => p.Reach ?? 0),
                    DonationReferrals = g.Sum(p => p.DonationReferrals ?? 0),
                    EngagementRate = g.Average(p => p.EngagementRate ?? 0)
                })
                .OrderByDescending(r => r.Reach)
                .ToListAsync();

            var platformPerformanceDtos = platformPerformance
                .Select(r => new ImpactPlatformDto(
                    r.Platform ?? "Unknown",
                    r.Reach,
                    r.DonationReferrals,
                    r.EngagementRate))
                .ToList();

            var safehouseData = await db.Safehouses
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .ToListAsync();

            var latestMetricsRaw = await db.SafehouseMonthlyMetrics
                .AsNoTracking()
                .ToListAsync();

            var latestMetrics = latestMetricsRaw
                .Where(m => m.MonthStart != null)
                .GroupBy(m => m.SafehouseId)
                .Select(g => g.OrderByDescending(m => m.MonthStart).First())
                .ToDictionary(m => m.SafehouseId);

            var safehouses = safehouseData.Select(s => new ImpactSafehouseDto(
                s.SafehouseId,
                s.Name,
                s.Region,
                s.City,
                s.CurrentOccupancy ?? 0,
                s.CapacityGirls ?? 0,
                s.CapacityStaff ?? 0,
                latestMetrics.TryGetValue(s.SafehouseId, out var m) ? m.AvgEducationProgress : null,
                latestMetrics.TryGetValue(s.SafehouseId, out var m2) ? m2.AvgHealthScore : null,
                latestMetrics.TryGetValue(s.SafehouseId, out var m3) ? m3.MonthStart?.ToString("MMM yyyy") : null
            )).ToList();

            var totals = new ImpactTotals(
                Safehouses: await db.Safehouses.CountAsync(),
                Supporters: await db.Supporters.CountAsync(),
                ActiveResidents: await db.Residents.CountAsync(r => r.CaseStatus == "Active"),
                TotalDonations: await db.Donations.CountAsync(),
                TotalDonationValuePhp: await db.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0)
            );

            donationTrend.Reverse();
            careTrend.Reverse();

            var mergedTrend = MergeTrendData(donationTrend, careTrend);
            var hero = BuildHero(latestSnapshot != null ? new ImpactSnapshotRow(latestSnapshot.SnapshotDate, latestSnapshot.Headline, latestSnapshot.SummaryText, latestSnapshot.PublishedAt) : null, totals);
            var metrics = BuildMetrics(totals);

            return Ok(new ImpactDashboardDto(
                hero,
                metrics,
                mergedTrend,
                platformPerformanceDtos,
                safehouses,
                publishedSnapshots.Select(s => new ImpactSnapshotDto(s.SnapshotDate, s.Headline, s.SummaryText, s.PublishedAt)).ToList(),
                DateTimeOffset.UtcNow,
                ["public_impact_snapshots", "donations", "safehouse_monthly_metrics", "social_media_posts", "safehouses", "residents", "supporters"]
            ));
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("**************** [ERROR] IMPACT DASHBOARD FAILED ****************");
            Console.Error.WriteLine(ex.ToString());
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Impact data is temporarily unavailable." });
        }
    }

    // Builds the hero section from the latest published snapshot, or falls back to live totals.
    private static ImpactHeroDto BuildHero(ImpactSnapshotRow? snapshot, ImpactTotals totals)
    {
        if (snapshot is not null)
        {
            var publishedLabel = snapshot.PublishedAt?.ToString("MMMM yyyy", System.Globalization.CultureInfo.InvariantCulture)
                                 ?? snapshot.SnapshotDate.ToString("MMMM yyyy", System.Globalization.CultureInfo.InvariantCulture);

            return new ImpactHeroDto(
                snapshot.Headline,
                snapshot.Summary,
                $"Published {publishedLabel}",
                "Updated from live database data"
            );
        }

        return new ImpactHeroDto(
            "A public view of safehouse impact",
            $"Project Haven currently tracks {totals.Safehouses:N0} safehouses, {totals.ActiveResidents:N0} active residents, and {totals.TotalDonations:N0} donations across the connected database.",
            "Published from live operational tables",
            "Updated from live database data"
        );
    }

    // Converts database totals into the four metric cards shown on the public page.
    private static IReadOnlyList<ImpactMetricDto> BuildMetrics(ImpactTotals totals)
    {
        return new[]
        {
            new ImpactMetricDto("Funds tracked", FormatPhp(totals.TotalDonationValuePhp), "Combined monetary and estimated donation value"),
            new ImpactMetricDto("Donors supported", totals.Supporters.ToString("N0"), "Registered supporter profiles in the database"),
            new ImpactMetricDto("Residents served", totals.ActiveResidents.ToString("N0"), "Residents currently marked active"),
            new ImpactMetricDto("Safehouses online", totals.Safehouses.ToString("N0"), "Operational sites in the connected deployment")
        };
    }

    // Joins donation and care trend data on month, filling missing months with zeros.
    private static IReadOnlyList<ImpactTrendPointDto> MergeTrendData(
        IReadOnlyList<MonthlyDonationRow> donationTrend,
        IReadOnlyList<MonthlyCareRow> careTrend)
    {
        var months = donationTrend.Select(row => row.MonthStart)
            .Union(careTrend.Select(row => row.MonthStart))
            .OrderBy(month => month)
            .ToArray();

        var donationLookup = donationTrend.ToDictionary(row => row.MonthStart);
        var careLookup = careTrend.ToDictionary(row => row.MonthStart);

        return months.Select(month =>
        {
            donationLookup.TryGetValue(month, out var donationRow);
            careLookup.TryGetValue(month, out var careRow);

            return new ImpactTrendPointDto(
                month.ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture),
                donationRow?.DonationAmountPhp ?? 0,
                careRow?.ActiveResidents ?? 0,
                careRow?.AvgEducationProgress ?? 0,
                careRow?.AvgHealthScore ?? 0
            );
        }).ToArray();
    }

    private static string FormatPhp(decimal amount) => $"PHP {amount:N0}";


    private sealed record ImpactSnapshotRow(DateTime SnapshotDate, string Headline, string Summary, DateTime? PublishedAt);

    private sealed record MonthlyDonationRow(DateTime MonthStart, decimal DonationAmountPhp);

    private sealed record MonthlyCareRow(DateTime MonthStart, int ActiveResidents, decimal AvgEducationProgress, decimal AvgHealthScore);

    private sealed record ImpactTotals(int Safehouses, int Supporters, int ActiveResidents, int TotalDonations, decimal TotalDonationValuePhp);
}
