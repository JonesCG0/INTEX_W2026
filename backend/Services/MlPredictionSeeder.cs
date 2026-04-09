using System.Data.Common;
using System.Globalization;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Services;

public sealed class MlPredictionSeeder(AppDbContext db, IWebHostEnvironment environment)
{
    public async Task SeedResidentReintegrationScoresAsync(CancellationToken cancellationToken = default)
    {
        await db.Database.OpenConnectionAsync(cancellationToken);

        try
        {
            if (await TableHasRowsAsync(cancellationToken))
            {
                return;
            }

            var csvPath = Path.Combine(environment.ContentRootPath, "ml-data", "resident_reintegration_queue.csv");
            if (!File.Exists(csvPath))
            {
                return;
            }

            await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

            foreach (var row in await File.ReadAllLinesAsync(csvPath, cancellationToken))
            {
                if (string.IsNullOrWhiteSpace(row) || row.StartsWith("resident_id,", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var columns = row.Split(',');
                if (columns.Length < 43)
                {
                    continue;
                }

                await InsertRowAsync(columns, transaction.GetDbTransaction(), cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private async Task<bool> TableHasRowsAsync(CancellationToken cancellationToken)
    {
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText = "SELECT TOP 1 1 FROM ml_resident_reintegration_scores;";
        var value = await command.ExecuteScalarAsync(cancellationToken);
        return value is not null && value is not DBNull;
    }

    private async Task InsertRowAsync(string[] columns, DbTransaction transaction, CancellationToken cancellationToken)
    {
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.Transaction = transaction;
        command.CommandText = """
            INSERT INTO ml_resident_reintegration_scores
            (
                resident_id,
                snapshot_date,
                case_status,
                age_years,
                latest_progress_percent,
                latest_general_health_score,
                reintegration_readiness_probability,
                predicted_ready_within_180d,
                prediction_timestamp,
                model_name
            )
            VALUES
            (
                @resident_id,
                @snapshot_date,
                @case_status,
                @age_years,
                @latest_progress_percent,
                @latest_general_health_score,
                @reintegration_readiness_probability,
                @predicted_ready_within_180d,
                @prediction_timestamp,
                @model_name
            );
            """;

        AddParameter(command, "@resident_id", ParseInt(columns[0]));
        AddParameter(command, "@snapshot_date", ParseDate(columns[1]));
        AddParameter(command, "@case_status", columns[5]);
        AddParameter(command, "@age_years", ParseDecimal(columns[7]));
        AddParameter(command, "@latest_progress_percent", ParseDecimal(columns[20]));
        AddParameter(command, "@latest_general_health_score", ParseDecimal(columns[24]));
        AddParameter(command, "@reintegration_readiness_probability", ParseDecimal(columns[39]) ?? 0m);
        AddParameter(command, "@predicted_ready_within_180d", ParseBool(columns[40]));
        AddParameter(command, "@prediction_timestamp", ParseDateTime(columns[41]));
        AddParameter(command, "@model_name", columns[42]);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddParameter(System.Data.Common.DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }

    private static int? ParseInt(string value)
        => int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;

    private static decimal? ParseDecimal(string value)
        => decimal.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed) ? parsed : null;

    private static DateTime? ParseDate(string value)
        => DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed) ? parsed : null;

    private static DateTime? ParseDateTime(string value)
        => DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed) ? parsed : null;

    private static bool ParseBool(string value)
        => value == "1" || value.Equals("true", StringComparison.OrdinalIgnoreCase);
}
