using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class AppUserSchemaInitializer(AppDbContext db)
{
    public async Task EnsureAsync(CancellationToken cancellationToken = default)
    {
        const string createTableSql = """
        IF OBJECT_ID(N'dbo.app_users', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.app_users
            (
                Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_app_users PRIMARY KEY,
                Email NVARCHAR(256) NOT NULL,
                DisplayName NVARCHAR(256) NOT NULL,
                PasswordHash NVARCHAR(512) NOT NULL,
                Role NVARCHAR(32) NOT NULL,
                CreatedAt DATETIME2(0) NOT NULL
            );
        END;
        """;

        const string createIndexSql = """
        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = N'IX_app_users_Email'
              AND object_id = OBJECT_ID(N'dbo.app_users')
        )
        BEGIN
            CREATE UNIQUE INDEX IX_app_users_Email ON dbo.app_users (Email);
        END;
        """;

        await db.Database.ExecuteSqlRawAsync(createTableSql, cancellationToken);
        await db.Database.ExecuteSqlRawAsync(createIndexSql, cancellationToken);
    }
}
