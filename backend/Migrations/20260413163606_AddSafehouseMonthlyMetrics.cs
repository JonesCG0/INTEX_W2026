using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSafehouseMonthlyMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tables may already exist on Azure (created by EnsurePublicImpactSchemaAsync /
            // EnsureAnalyticalMetricsSchemaAsync at startup). Only create if absent.
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[public_impact_snapshots]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [public_impact_snapshots] (
                        [snapshot_id] int NOT NULL IDENTITY,
                        [snapshot_date] datetime2 NOT NULL,
                        [headline] nvarchar(120) NOT NULL,
                        [summary_text] nvarchar(max) NOT NULL,
                        [is_published] bit NOT NULL,
                        [published_at] datetime2 NULL,
                        CONSTRAINT [PK_public_impact_snapshots] PRIMARY KEY ([snapshot_id])
                    );
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[safehouse_monthly_metrics]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [safehouse_monthly_metrics] (
                        [metric_id] int NOT NULL IDENTITY,
                        [safehouse_id] int NOT NULL,
                        [month_start] datetime2 NULL,
                        [active_residents] int NULL,
                        [avg_education_progress] decimal(18,4) NULL,
                        [avg_health_score] decimal(18,4) NULL,
                        CONSTRAINT [PK_safehouse_monthly_metrics] PRIMARY KEY ([metric_id])
                    );
                END
                ELSE
                BEGIN
                    IF COL_LENGTH(N'safehouse_monthly_metrics', N'avg_education_progress') IS NULL
                        ALTER TABLE [safehouse_monthly_metrics] ADD [avg_education_progress] decimal(18,4) NULL;
                    IF COL_LENGTH(N'safehouse_monthly_metrics', N'avg_health_score') IS NULL
                        ALTER TABLE [safehouse_monthly_metrics] ADD [avg_health_score] decimal(18,4) NULL;
                    IF COL_LENGTH(N'safehouse_monthly_metrics', N'active_residents') IS NULL
                        ALTER TABLE [safehouse_monthly_metrics] ADD [active_residents] int NULL;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "public_impact_snapshots");

            migrationBuilder.DropTable(
                name: "safehouse_monthly_metrics");
        }
    }
}
