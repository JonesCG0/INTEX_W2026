using Microsoft.Data.SqlClient;
using System.Collections.Frozen;

namespace backend.Data;

public static class DatabaseSchemaProbe
{
    private static readonly (string Table, string PK)[] ProbeTargets = 
    [
        ("supporters", "supporter_id"),
        ("donations", "donation_id"),
        ("safehouses", "safehouse_id"),
        ("residents", "resident_id"),
        ("process_recordings", "recording_id"),
        ("home_visitations", "visitation_id"),
        ("intervention_plans", "plan_id"),
        ("social_media_posts", "post_id"),
        ("donation_allocations", "allocation_id")
    ];

    public static async Task<DatabaseKeyMode> DetectAsync(string? connectionString, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return new DatabaseKeyMode();
        }

        var manualTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var builder = new SqlConnectionStringBuilder(connectionString) { ConnectTimeout = 8 };
        await using var conn = new SqlConnection(builder.ConnectionString);
        await conn.OpenAsync(cancellationToken);

        foreach (var (table, pk) in ProbeTargets)
        {
            if (await IsManualAssignmentNeededAsync(conn, table, pk, cancellationToken))
            {
                manualTables.Add(table);
            }
        }

        return new DatabaseKeyMode 
        { 
            ManualAssignmentTables = manualTables.ToFrozenSet(StringComparer.OrdinalIgnoreCase)
        };
    }

    private static async Task<bool> IsManualAssignmentNeededAsync(SqlConnection conn, string tableName, string columnName, CancellationToken cancellationToken)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"""
            SELECT CASE
                WHEN OBJECT_ID(N'{tableName}', N'U') IS NULL THEN -1
                ELSE COALESCE(COLUMNPROPERTY(OBJECT_ID(N'{tableName}', N'U'), N'{columnName}', N'IsIdentity'), 0)
            END
            """;

        var scalar = await cmd.ExecuteScalarAsync(cancellationToken);
        var code = scalar is null or DBNull ? -1 : Convert.ToInt32(scalar);

        return code == 0;
    }
}
