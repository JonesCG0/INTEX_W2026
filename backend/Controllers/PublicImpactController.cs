using System.Data.Common;
using backend.Data;
using backend.Models.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/public")]
public class PublicImpactController(AppDbContext db) : ControllerBase
{
    [HttpGet("impact")]
    [AllowAnonymous]
    public async Task<ActionResult<ImpactDashboardDto>> GetImpactDashboard()
    {
        var connection = db.Database.GetDbConnection();
        await db.Database.OpenConnectionAsync();

        try
        {
            var latestSnapshot = await ReadLatestSnapshotAsync(connection);
            var publishedSnapshots = await ReadSnapshotsAsync(connection);
            var donationTrend = await ReadDonationTrendAsync(connection);
            var careTrend = await ReadCareTrendAsync(connection);
            var platformPerformance = await ReadPlatformPerformanceAsync(connection);
            var safehouses = await ReadSafehousesAsync(connection);
            var totals = await ReadTotalsAsync(connection);

            var mergedTrend = MergeTrendData(donationTrend, careTrend);
            var hero = BuildHero(latestSnapshot, totals);
            var metrics = BuildMetrics(totals);

            return Ok(new ImpactDashboardDto(
                hero,
                metrics,
                mergedTrend,
                platformPerformance,
                safehouses,
                publishedSnapshots,
                DateTimeOffset.UtcNow
            ));
        }
        catch (DbException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Impact data is temporarily unavailable." });
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Impact data is temporarily unavailable." });
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

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

    private static async Task<ImpactSnapshotRow?> ReadLatestSnapshotAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                snapshot_date,
                headline,
                summary_text,
                published_at
            FROM public_impact_snapshots
            WHERE is_published = 1
            ORDER BY snapshot_date DESC, published_at DESC
            LIMIT 1;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new ImpactSnapshotRow(
            reader.GetDateTime(reader.GetOrdinal("snapshot_date")),
            reader.GetString(reader.GetOrdinal("headline")),
            reader.GetString(reader.GetOrdinal("summary_text")),
            reader.IsDBNull(reader.GetOrdinal("published_at"))
                ? null
                : reader.GetDateTime(reader.GetOrdinal("published_at"))
        );
    }

    private static async Task<IReadOnlyList<ImpactSnapshotDto>> ReadSnapshotsAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                snapshot_date,
                headline,
                summary_text,
                published_at
            FROM public_impact_snapshots
            WHERE is_published = 1
            ORDER BY snapshot_date DESC, published_at DESC
            LIMIT 3;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var snapshots = new List<ImpactSnapshotDto>();

        while (await reader.ReadAsync())
        {
            snapshots.Add(new ImpactSnapshotDto(
                reader.GetDateTime(reader.GetOrdinal("snapshot_date")),
                reader.GetString(reader.GetOrdinal("headline")),
                reader.GetString(reader.GetOrdinal("summary_text")),
                reader.IsDBNull(reader.GetOrdinal("published_at"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("published_at"))
            ));
        }

        return snapshots;
    }

    private static async Task<IReadOnlyList<MonthlyDonationRow>> ReadDonationTrendAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                strftime('%Y-%m-01', donation_date) AS month_start,
                SUM(COALESCE(amount, estimated_value, 0)) AS donation_amount_php
            FROM donations
            GROUP BY strftime('%Y-%m-01', donation_date)
            ORDER BY month_start DESC
            LIMIT 6;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<MonthlyDonationRow>();

        while (await reader.ReadAsync())
        {
            rows.Add(new MonthlyDonationRow(
                reader.GetDateTime(reader.GetOrdinal("month_start")),
                reader.IsDBNull(reader.GetOrdinal("donation_amount_php"))
                    ? 0
                    : reader.GetDecimal(reader.GetOrdinal("donation_amount_php"))
            ));
        }

        rows.Reverse();
        return rows;
    }

    private static async Task<IReadOnlyList<MonthlyCareRow>> ReadCareTrendAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                month_start,
                SUM(active_residents) AS active_residents,
                AVG(avg_education_progress) AS avg_education_progress,
                AVG(avg_health_score) AS avg_health_score
            FROM safehouse_monthly_metrics
            GROUP BY month_start
            ORDER BY month_start DESC
            LIMIT 6;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<MonthlyCareRow>();

        while (await reader.ReadAsync())
        {
            rows.Add(new MonthlyCareRow(
                reader.GetDateTime(reader.GetOrdinal("month_start")),
                reader.IsDBNull(reader.GetOrdinal("active_residents"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("active_residents")),
                reader.IsDBNull(reader.GetOrdinal("avg_education_progress"))
                    ? 0
                    : reader.GetDecimal(reader.GetOrdinal("avg_education_progress")),
                reader.IsDBNull(reader.GetOrdinal("avg_health_score"))
                    ? 0
                    : reader.GetDecimal(reader.GetOrdinal("avg_health_score"))
            ));
        }

        rows.Reverse();
        return rows;
    }

    private static async Task<IReadOnlyList<ImpactPlatformDto>> ReadPlatformPerformanceAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                platform,
                SUM(reach) AS reach,
                SUM(donation_referrals) AS donation_referrals,
                AVG(engagement_rate) AS engagement_rate
            FROM social_media_posts
            GROUP BY platform
            ORDER BY SUM(reach) DESC;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<ImpactPlatformDto>();

        while (await reader.ReadAsync())
        {
            rows.Add(new ImpactPlatformDto(
                reader.GetString(reader.GetOrdinal("platform")),
                reader.IsDBNull(reader.GetOrdinal("reach"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("reach")),
                reader.IsDBNull(reader.GetOrdinal("donation_referrals"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("donation_referrals")),
                reader.IsDBNull(reader.GetOrdinal("engagement_rate"))
                    ? 0
                    : reader.GetDecimal(reader.GetOrdinal("engagement_rate"))
            ));
        }

        return rows;
    }

    private static async Task<IReadOnlyList<ImpactSafehouseDto>> ReadSafehousesAsync(DbConnection connection)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                s.safehouse_id,
                s.name,
                s.region,
                s.city,
                s.current_occupancy,
                s.capacity_girls,
                s.capacity_staff,
                m.month_start,
                m.avg_education_progress,
                m.avg_health_score
            FROM safehouses AS s
            LEFT JOIN (
                SELECT sm.safehouse_id, sm.month_start, sm.avg_education_progress, sm.avg_health_score
                FROM safehouse_monthly_metrics sm
                INNER JOIN (
                    SELECT safehouse_id, MAX(month_start) as latest_month
                    FROM safehouse_monthly_metrics
                    GROUP BY safehouse_id
                ) sm_desc ON sm.safehouse_id = sm_desc.safehouse_id AND sm.month_start = sm_desc.latest_month
            ) AS m ON s.safehouse_id = m.safehouse_id
            ORDER BY s.name;
            """;

        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<ImpactSafehouseDto>();

        while (await reader.ReadAsync())
        {
            rows.Add(new ImpactSafehouseDto(
                reader.GetInt32(reader.GetOrdinal("safehouse_id")),
                reader.GetString(reader.GetOrdinal("name")),
                reader.GetString(reader.GetOrdinal("region")),
                reader.GetString(reader.GetOrdinal("city")),
                reader.IsDBNull(reader.GetOrdinal("current_occupancy"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("current_occupancy")),
                reader.IsDBNull(reader.GetOrdinal("capacity_girls"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("capacity_girls")),
                reader.IsDBNull(reader.GetOrdinal("capacity_staff"))
                    ? 0
                    : reader.GetInt32(reader.GetOrdinal("capacity_staff")),
                reader.IsDBNull(reader.GetOrdinal("avg_education_progress"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("avg_education_progress")),
                reader.IsDBNull(reader.GetOrdinal("avg_health_score"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("avg_health_score")),
                reader.IsDBNull(reader.GetOrdinal("month_start"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("month_start")).ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture)
            ));
        }

        return rows;
    }

    private static async Task<ImpactTotals> ReadTotalsAsync(DbConnection connection)
    {
        var safehouses = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM safehouses;");
        var supporters = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM supporters;");
        var activeResidents = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM residents WHERE case_status = 'Active';");
        var totalDonations = await ExecuteScalarIntAsync(connection, "SELECT COUNT(*) FROM donations;");
        var totalDonationValue = await ExecuteScalarDecimalAsync(connection, "SELECT COALESCE(SUM(COALESCE(amount, estimated_value, 0)), 0) FROM donations;");

        return new ImpactTotals(
            Safehouses: safehouses,
            Supporters: supporters,
            ActiveResidents: activeResidents,
            TotalDonations: totalDonations,
            TotalDonationValuePhp: totalDonationValue
        );
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

    private sealed record ImpactSnapshotRow(DateTime SnapshotDate, string Headline, string Summary, DateTime? PublishedAt);

    private sealed record MonthlyDonationRow(DateTime MonthStart, decimal DonationAmountPhp);

    private sealed record MonthlyCareRow(DateTime MonthStart, int ActiveResidents, decimal AvgEducationProgress, decimal AvgHealthScore);

    private sealed record ImpactTotals(int Safehouses, int Supporters, int ActiveResidents, int TotalDonations, decimal TotalDonationValuePhp);
}
