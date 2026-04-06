using System.Data.Common;
using System.Globalization;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic.FileIO;

namespace backend.Services;

public sealed class CsvDatabaseSeeder(AppDbContext db)
{
    public async Task SeedAsync(string csvPath, CancellationToken cancellationToken = default)
    {
        var connectionString = db.Database.GetConnectionString();
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("No database connection string is configured. Set ConnectionStrings:DefaultConnection before running the CSV seed command.");
        }

        var rootDirectory = ResolveCsvDirectory(csvPath);
        var csvFiles = Directory.GetFiles(rootDirectory, "*.csv", System.IO.SearchOption.TopDirectoryOnly)
            .OrderBy(Path.GetFileName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (csvFiles.Length == 0)
        {
            throw new FileNotFoundException($"No CSV files were found in '{rootDirectory}'.");
        }

        var connection = db.Database.GetDbConnection();
        await db.Database.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            foreach (var file in csvFiles)
            {
                var tableName = Path.GetFileNameWithoutExtension(file);
                var csv = ReadCsv(file);

                if (csv.Headers.Length == 0)
                {
                    continue;
                }

                var columnDefinitions = InferColumns(csv.Headers, csv.Rows);

                await DropTableAsync(connection, transaction, tableName, cancellationToken);
                await CreateTableAsync(connection, transaction, tableName, columnDefinitions, cancellationToken);
                await InsertRowsAsync(connection, transaction, tableName, columnDefinitions, csv.Rows, cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private static string ResolveCsvDirectory(string csvPath)
    {
        var fullPath = Path.GetFullPath(csvPath, Directory.GetCurrentDirectory());

        if (Directory.Exists(fullPath) && Directory.GetFiles(fullPath, "*.csv", System.IO.SearchOption.TopDirectoryOnly).Length > 0)
        {
            return fullPath;
        }

        if (Directory.Exists(fullPath))
        {
            var nestedCsvDirectory = Directory.GetDirectories(fullPath)
                .FirstOrDefault(directory => Directory.GetFiles(directory, "*.csv", System.IO.SearchOption.TopDirectoryOnly).Length > 0);

            if (nestedCsvDirectory is not null)
            {
                return nestedCsvDirectory;
            }
        }

        throw new DirectoryNotFoundException($"Could not find a CSV directory at '{csvPath}'.");
    }

    private static CsvFile ReadCsv(string filePath)
    {
        using var parser = new TextFieldParser(filePath);
        parser.TextFieldType = FieldType.Delimited;
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = false;

        if (parser.EndOfData)
        {
            return new CsvFile(Array.Empty<string>(), new List<string?[]>());
        }

        var headers = parser.ReadFields() ?? Array.Empty<string>();
        var rows = new List<string?[]>();

        while (!parser.EndOfData)
        {
            var fields = parser.ReadFields() ?? Array.Empty<string>();
            var row = new string?[headers.Length];

            for (var i = 0; i < headers.Length; i++)
            {
                row[i] = i < fields.Length ? fields[i] : null;
            }

            rows.Add(row);
        }

        return new CsvFile(headers, rows);
    }

    private static ColumnDefinition[] InferColumns(string[] headers, IReadOnlyList<string?[]> rows)
    {
        var columns = new ColumnDefinition[headers.Length];

        for (var i = 0; i < headers.Length; i++)
        {
            var values = rows.Select(row => i < row.Length ? row[i] : null).ToArray();
            columns[i] = new ColumnDefinition(headers[i], InferSqlType(values));
        }

        return columns;
    }

    private static string InferSqlType(IEnumerable<string?> values)
    {
        var nonEmptyValues = values.Where(value => !string.IsNullOrWhiteSpace(value)).Select(value => value!.Trim()).ToArray();

        if (nonEmptyValues.Length == 0)
        {
            return "nvarchar(max)";
        }

        if (nonEmptyValues.All(value => bool.TryParse(value, out _)))
        {
            return "bit";
        }

        if (TryInferInteger(nonEmptyValues))
        {
            return "int";
        }

        if (TryInferDecimal(nonEmptyValues))
        {
            return "decimal(18,6)";
        }

        if (TryInferDateTime(nonEmptyValues, out var sqlType))
        {
            return sqlType;
        }

        return "nvarchar(max)";
    }

    private static bool TryInferInteger(IEnumerable<string> values)
    {
        foreach (var value in values)
        {
            if (int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out _))
            {
                continue;
            }

            // Accept "8.0"-style whole-number decimals as integers
            if (decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var d) &&
                decimal.Truncate(d) == d &&
                d >= int.MinValue &&
                d <= int.MaxValue)
            {
                continue;
            }

            return false;
        }

        return true;
    }

    private static bool TryInferDecimal(IEnumerable<string> values)
    {
        foreach (var value in values)
        {
            if (!decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out _))
            {
                return false;
            }
        }

        return true;
    }

    private static bool TryInferDateTime(IEnumerable<string> values, out string sqlType)
    {
        var sawTimeComponent = false;

        foreach (var value in values)
        {
            if (!DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out _))
            {
                sqlType = string.Empty;
                return false;
            }

            if (value.Contains(':') || value.Contains('T') || value.Contains(' '))
            {
                sawTimeComponent = true;
            }
        }

        sqlType = sawTimeComponent ? "datetime2(0)" : "date";
        return true;
    }

    private static async Task DropTableAsync(DbConnection connection, DbTransaction transaction, string tableName, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = $"DROP TABLE IF EXISTS dbo.{QuoteIdentifier(tableName)};";
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task CreateTableAsync(DbConnection connection, DbTransaction transaction, string tableName, IReadOnlyList<ColumnDefinition> columns, CancellationToken cancellationToken)
    {
        var columnSql = string.Join(", ", columns.Select(column => $"{QuoteIdentifier(column.Name)} {column.SqlType} NULL"));

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = $"CREATE TABLE dbo.{QuoteIdentifier(tableName)} ({columnSql});";
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task InsertRowsAsync(DbConnection connection, DbTransaction transaction, string tableName, IReadOnlyList<ColumnDefinition> columns, IReadOnlyList<string?[]> rows, CancellationToken cancellationToken)
    {
        if (rows.Count == 0)
        {
            return;
        }

        var columnList = string.Join(", ", columns.Select(column => QuoteIdentifier(column.Name)));
        var parameterList = string.Join(", ", columns.Select((_, index) => $"@p{index}"));

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = $"INSERT INTO dbo.{QuoteIdentifier(tableName)} ({columnList}) VALUES ({parameterList});";

        foreach (var row in rows)
        {
            command.Parameters.Clear();

            for (var i = 0; i < columns.Count; i++)
            {
                var parameter = command.CreateParameter();
                parameter.ParameterName = $"@p{i}";
                parameter.Value = ConvertValue(row, i, columns[i].SqlType);
                command.Parameters.Add(parameter);
            }

            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private static object? ConvertValue(IReadOnlyList<string?> row, int index, string sqlType)
    {
        if (index >= row.Count)
        {
            return DBNull.Value;
        }

        var rawValue = row[index];
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return DBNull.Value;
        }

        var trimmedValue = rawValue.Trim();

        return sqlType switch
        {
            "bit" => bool.Parse(trimmedValue),
            "int" => ConvertToInt(trimmedValue),
            "decimal(18,6)" => decimal.Parse(trimmedValue, NumberStyles.Number, CultureInfo.InvariantCulture),
            "date" or "datetime2(0)" => DateTime.Parse(trimmedValue, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces),
            _ => trimmedValue
        };
    }

    private static int ConvertToInt(string value)
    {
        // Handle both "8" and "8.0" style values
        if (decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var decimalValue))
        {
            var truncated = decimal.Truncate(decimalValue);
            if (truncated >= int.MinValue && truncated <= int.MaxValue)
            {
                return (int)truncated;
            }
        }

        throw new FormatException($"The input string '{value}' was not in a correct format as an integer.");
    }

    private static string QuoteIdentifier(string identifier)
        => $"[{identifier.Replace("]", "]]")}]";

    private sealed record CsvFile(string[] Headers, List<string?[]> Rows);

    private sealed record ColumnDefinition(string Name, string SqlType);
}
