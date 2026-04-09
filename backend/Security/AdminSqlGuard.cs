using System.Text.RegularExpressions;

namespace backend.Security;

public static partial class AdminSqlGuard
{
    private static readonly string[] AllowedTables =
    [
        "donation_allocations",
        "donations",
        "education_records",
        "health_wellbeing_records",
        "home_visitations",
        "intervention_plans",
        "ml_resident_reintegration_scores",
        "process_recordings",
        "public_impact_snapshots",
        "residents",
        "safehouse_monthly_metrics",
        "safehouses",
        "social_media_posts",
        "supporters"
    ];

    private static readonly string[] BlockedTokens =
    [
        "--",
        "/*",
        "*/",
        ";",
        " alter ",
        " backup ",
        " create ",
        " delete ",
        " drop ",
        " exec ",
        " execute ",
        " grant ",
        " insert ",
        " merge ",
        " revoke ",
        " truncate ",
        " update ",
        " xp_",
        " sp_"
    ];

    public static bool TryValidateReadOnlyQuery(string? sql, out string normalizedSql, out string error)
    {
        normalizedSql = string.Empty;
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(sql))
        {
            error = "SQL is required.";
            return false;
        }

        normalizedSql = sql.Trim();
        if (normalizedSql.Length > 2000)
        {
            error = "Query is too long.";
            return false;
        }

        var lowered = $" {NormalizeWhitespaceRegex().Replace(normalizedSql, " ").ToLowerInvariant()} ";
        if (!(lowered.StartsWith(" select ") || lowered.StartsWith(" with ")))
        {
            error = "Only single SELECT queries are allowed.";
            return false;
        }

        if (BlockedTokens.Any(token => lowered.Contains(token, StringComparison.Ordinal)))
        {
            error = "Only single read-only queries are allowed.";
            return false;
        }

        var referencedTables = ReferencedTableRegex()
            .Matches(lowered)
            .Select(match => match.Groups["table"].Value.Trim('[', ']', '"'))
            .Where(table => !string.IsNullOrWhiteSpace(table))
            .Select(table => table.Contains('.') ? table.Split('.').Last() : table)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (referencedTables.Length == 0)
        {
            error = "Query must reference an allowed reporting table.";
            return false;
        }

        var disallowedTable = referencedTables
            .FirstOrDefault(table => !AllowedTables.Contains(table, StringComparer.OrdinalIgnoreCase));

        if (disallowedTable is not null)
        {
            error = $"Queries against '{disallowedTable}' are not allowed.";
            return false;
        }

        return true;
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex NormalizeWhitespaceRegex();

    [GeneratedRegex(@"\b(?:from|join)\s+(?<table>(?:\[[^\]]+\]|""[^""]+""|[a-z0-9_\.]+))", RegexOptions.IgnoreCase)]
    private static partial Regex ReferencedTableRegex();
}
