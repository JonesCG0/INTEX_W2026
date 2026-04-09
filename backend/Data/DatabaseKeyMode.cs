using System.Collections.Frozen;

namespace backend.Data;

/// <summary>
/// When legacy Azure tables exist without IDENTITY on primary keys,
/// EF's INSERT..OUTPUT pattern returns NULL and SaveChanges fails.
/// In those cases, we assign keys in the application before insert.
/// </summary>
public sealed class DatabaseKeyMode
{
    /// <summary>
    /// Tables names (case-insensitive) that require manual ID assignment.
    /// </summary>
    public FrozenSet<string> ManualAssignmentTables { get; init; } = FrozenSet<string>.Empty;

    public bool IsManual(string tableName) => 
        ManualAssignmentTables.Contains(tableName);
}
