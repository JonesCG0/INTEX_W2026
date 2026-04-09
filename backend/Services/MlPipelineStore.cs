using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class MlPipelineStore
{
    private readonly AzureMlOptions _options;
    private readonly string _repoRoot;
    private readonly string[] _outputRoots;
    private readonly List<PipelineDefinition> _definitions;
    private readonly List<MlPipelineRunRecord> _runs = [];
    private readonly object _gate = new();

    public MlPipelineStore(IOptions<AzureMlOptions> options, IWebHostEnvironment environment)
    {
        _options = options.Value;
        _repoRoot = Path.GetFullPath(Path.Combine(environment.ContentRootPath, ".."));
        _outputRoots =
        [
            Path.Combine(_repoRoot, "ml-pipelines", "generated_outputs"),
            Path.Combine(_repoRoot, "generated_outputs"),
            Path.Combine(environment.ContentRootPath, "generated_outputs"),
        ];
        _definitions =
        [
            new PipelineDefinition(
                Key: "donor-lapse-classification",
                Name: "Donor lapse classification",
                Domain: "Donor stewardship",
                Status: "Ready",
                Purpose: "Predict which supporters are most likely to lapse within 180 days so the stewardship team can act early.",
                NotebookPath: "ml-pipelines/donor_lapse_classification.ipynb",
                OutputFileName: "donor_lapse_scores.csv",
                PrimaryMetricLabel: "Highest lapse risk",
                PrimaryMetricColumn: "lapse_probability",
                Inputs: ["donors", "donations", "campaigns", "social_media_posts"],
                Outputs: ["risk tiers", "follow-up recommendation", "score table"],
                ResultSummary: "Flags supporters who need immediate re-engagement or routine stewardship."
            ),
            new PipelineDefinition(
                Key: "reintegration-readiness-classifications",
                Name: "Reintegration readiness classification",
                Domain: "Case management",
                Status: "Ready",
                Purpose: "Rank residents by readiness for reintegration planning within the next 180 days.",
                NotebookPath: "ml-pipelines/reintegration_readiness_classifications.ipynb",
                OutputFileName: "resident_reintegration_queue.csv",
                PrimaryMetricLabel: "Top readiness",
                PrimaryMetricColumn: "reintegration_readiness_probability",
                Inputs: ["residents", "process_recordings", "home_visitations", "education_records", "health_wellbeing_records", "intervention_plans", "incident_reports"],
                Outputs: ["reintegration queue", "probability score", "case review priorities"],
                ResultSummary: "Surfaces residents that should move into review, reassessment, or reintegration planning."
            ),
            new PipelineDefinition(
                Key: "social-media-donation-conversion-classifier",
                Name: "Social media donation conversion classifier",
                Domain: "Outreach and communications",
                Status: "Ready",
                Purpose: "Estimate which planned posts are most likely to drive donation referrals before they are published.",
                NotebookPath: "ml-pipelines/social-media-donation-conversion-classifier.ipynb",
                OutputFileName: "social_media_planning_scores.csv",
                PrimaryMetricLabel: "Best conversion",
                PrimaryMetricColumn: "predicted_high_conversion_probability",
                Inputs: ["social_media_posts", "donations"],
                Outputs: ["content ranking", "conversion probability", "publish timing guidance"],
                ResultSummary: "Ranks planned posts so the team can favor high-conversion content and timing."
            ),
            new PipelineDefinition(
                Key: "case-conference-priority-forecast",
                Name: "Case conference priority forecast",
                Domain: "Planned pipeline",
                Status: "Planned",
                Purpose: "Forecast which residents should be prioritized for the next case conference using recent case activity.",
                NotebookPath: "ml-pipelines/case_conference_priority_forecast.ipynb",
                OutputFileName: "case_conference_priority_scores.csv",
                PrimaryMetricLabel: "Build status",
                PrimaryMetricColumn: string.Empty,
                Inputs: ["process_recordings", "home_visitations", "education_records", "health_wellbeing_records", "incident_reports"],
                Outputs: ["priority score", "conference ordering", "review notes"],
                ResultSummary: "This is the fourth notebook slot. Add it once you are ready to model case conference urgency."
            ),
        ];
    }

    public Task<MlPipelinesOverviewDto> GetOverviewAsync()
    {
        lock (_gate)
        {
            var snapshotRuns = _definitions
                .SelectMany(BuildSnapshotRuns)
                .Concat(_runs)
                .OrderByDescending(run => run.StartedAt)
                .ToArray();

            var pipelines = _definitions
                .Select(definition =>
                {
                    var snapshot = BuildSnapshot(definition);
                    var recentRuns = snapshotRuns
                        .Where(run => run.PipelineKey.Equals(definition.Key, StringComparison.OrdinalIgnoreCase))
                        .OrderByDescending(run => run.StartedAt)
                        .Take(3)
                        .Select(run => ToDto(run, definition.Name))
                        .ToArray();

                    return new MlPipelineDto(
                        definition.Key,
                        definition.Name,
                        definition.Domain,
                        definition.Status,
                        definition.Purpose,
                        definition.NotebookPath,
                        definition.OutputFileName,
                        snapshot.PrimaryMetricLabel,
                        snapshot.PrimaryMetricValue,
                        snapshot.ResultSummary,
                        definition.Inputs,
                        definition.Outputs,
                        snapshot.Snapshot,
                        recentRuns
                    );
                })
                .ToArray();

            var recentRuns = snapshotRuns
                .OrderByDescending(run => run.StartedAt)
                .Take(10)
                .Select(run =>
                {
                    var definition = _definitions.First(item => item.Key.Equals(run.PipelineKey, StringComparison.OrdinalIgnoreCase));
                    return ToDto(run, definition.Name);
                })
                .ToArray();

            return Task.FromResult(new MlPipelinesOverviewDto(
                new MlIntegrationDto(
                    Mode: string.IsNullOrWhiteSpace(_options.Mode) ? "Demo" : _options.Mode.Trim(),
                    StudioUrl: string.IsNullOrWhiteSpace(_options.StudioUrl) ? null : _options.StudioUrl.Trim(),
                    WorkspaceName: string.IsNullOrWhiteSpace(_options.WorkspaceName) ? null : _options.WorkspaceName.Trim(),
                    ResourceGroup: string.IsNullOrWhiteSpace(_options.ResourceGroup) ? null : _options.ResourceGroup.Trim(),
                    SubscriptionId: string.IsNullOrWhiteSpace(_options.SubscriptionId) ? null : _options.SubscriptionId.Trim(),
                    StatusMessage: BuildStatusMessage()
                ),
                pipelines,
                recentRuns,
                DateTimeOffset.UtcNow
            ));
        }
    }

    public Task<MlPipelineRunDto> StartRunAsync(string key, string? notes)
    {
        var definition = GetDefinition(key);
        if (!definition.IsRunnable)
        {
            throw new InvalidOperationException("This pipeline is planned and cannot be run yet.");
        }

        var run = new MlPipelineRunRecord(
            RunId: Guid.NewGuid().ToString("N")[..12],
            PipelineKey: definition.Key,
            StartedAt: DateTimeOffset.UtcNow,
            Notes: string.IsNullOrWhiteSpace(notes) ? null : notes.Trim()
        );

        lock (_gate)
        {
            _runs.Add(run);
        }

        return Task.FromResult(ToDto(run, definition.Name));
    }

    public Task<MlPipelineRunDto?> GetRunAsync(string key, string runId)
    {
        var definition = GetDefinition(key);
        lock (_gate)
        {
            var run = _runs.FirstOrDefault(item =>
                item.PipelineKey.Equals(definition.Key, StringComparison.OrdinalIgnoreCase) &&
                item.RunId.Equals(runId, StringComparison.OrdinalIgnoreCase));

            return Task.FromResult(run is null ? null : ToDto(run, definition.Name));
        }
    }

    private PipelineDefinition GetDefinition(string key)
    {
        var definition = _definitions.FirstOrDefault(item => item.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
        return definition ?? throw new KeyNotFoundException("Pipeline not found.");
    }

    private string BuildStatusMessage()
    {
        if (string.Equals(_options.Mode, "AzureMl", StringComparison.OrdinalIgnoreCase))
        {
            return "Azure ML mode is enabled. The webapp can show live pipeline runs once the workspace endpoint is configured.";
        }

        return "Demo mode is enabled. The page shows the notebooks, current output snapshots, and simulated run history until Azure ML is connected.";
    }

    private MlPipelineSnapshotData BuildSnapshot(PipelineDefinition definition)
    {
        if (string.IsNullOrWhiteSpace(definition.OutputFileName))
        {
            return new MlPipelineSnapshotData(
                ResultSummary: definition.ResultSummary,
                PrimaryMetricLabel: definition.PrimaryMetricLabel,
                PrimaryMetricValue: definition.Status,
                Snapshot: new MlPipelineSnapshotDto(null, null, 0, [], [])
            );
        }

        var outputPath = ResolveOutputPath(definition.OutputFileName);
        if (!File.Exists(outputPath))
        {
            return new MlPipelineSnapshotData(
                ResultSummary: definition.ResultSummary,
                PrimaryMetricLabel: definition.PrimaryMetricLabel,
                PrimaryMetricValue: definition.Status,
                Snapshot: new MlPipelineSnapshotDto(definition.OutputFileName, null, 0, [], [])
            );
        }

        var lines = File.ReadAllLines(outputPath);
        if (lines.Length == 0)
        {
            return new MlPipelineSnapshotData(
                ResultSummary: definition.ResultSummary,
                PrimaryMetricLabel: definition.PrimaryMetricLabel,
                PrimaryMetricValue: definition.Status,
                Snapshot: new MlPipelineSnapshotDto(definition.OutputFileName, File.GetLastWriteTimeUtc(outputPath).ToString("u"), 0, [], [])
            );
        }

        var headers = SplitCsvLine(lines[0]);
        var previewRows = lines.Skip(1)
            .Take(5)
            .Select(SplitCsvLine)
            .Select(row => (IReadOnlyList<string>)row)
            .ToArray();

        var rowCount = Math.Max(lines.Length - 1, 0);
        var primaryMetricValue = GetPrimaryMetricValue(definition, headers, lines.Skip(1));
        var resultSummary = BuildResultSummary(definition, rowCount, primaryMetricValue);

        return new MlPipelineSnapshotData(
            ResultSummary: resultSummary,
            PrimaryMetricLabel: definition.PrimaryMetricLabel,
            PrimaryMetricValue: primaryMetricValue,
            Snapshot: new MlPipelineSnapshotDto(
                definition.OutputFileName,
                File.GetLastWriteTimeUtc(outputPath).ToString("u"),
                rowCount,
                headers,
                previewRows
            )
        );
    }

    private IEnumerable<MlPipelineRunRecord> BuildSnapshotRuns(PipelineDefinition definition)
    {
        if (string.IsNullOrWhiteSpace(definition.OutputFileName))
        {
            yield break;
        }

        var outputPath = ResolveOutputPath(definition.OutputFileName);
        if (!File.Exists(outputPath))
        {
            yield break;
        }

        var fileInfo = new FileInfo(outputPath);
        var snapshot = BuildSnapshot(definition);

        yield return new MlPipelineRunRecord(
            RunId: $"snapshot-{definition.Key}",
            PipelineKey: definition.Key,
            StartedAt: new DateTimeOffset(fileInfo.LastWriteTimeUtc),
            Notes: "Snapshot loaded from generated_outputs",
            StatusOverride: "Succeeded",
            CompletedAtOverride: new DateTimeOffset(fileInfo.LastWriteTimeUtc),
            ResultFileNameOverride: definition.OutputFileName,
            ResultSummaryOverride: snapshot.ResultSummary,
            ProgressOverride: 100
        );
    }

    private string ResolveOutputPath(string fileName)
    {
        foreach (var outputRoot in _outputRoots)
        {
            var candidate = Path.Combine(outputRoot, fileName);
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        return Path.Combine(_outputRoots[0], fileName);
    }

    private static MlPipelineRunDto ToDto(MlPipelineRunRecord run, string pipelineName)
    {
        var state = EvaluateState(run);
        return new MlPipelineRunDto(
            run.RunId,
            run.PipelineKey,
            pipelineName,
            state.Status,
            state.ProgressPercent,
            run.StartedAt,
            state.CompletedAt,
            state.Message,
            state.ResultFileName,
            state.ResultSummary
        );
    }

    private static RunState EvaluateState(MlPipelineRunRecord run)
    {
        if (run.StatusOverride is not null)
        {
            return new RunState(
                run.StatusOverride,
                run.ProgressOverride ?? 100,
                run.CompletedAtOverride ?? run.StartedAt,
                "Snapshot created from the latest generated output.",
                run.ResultFileNameOverride,
                run.ResultSummaryOverride
            );
        }

        var age = DateTimeOffset.UtcNow - run.StartedAt;
        if (age < TimeSpan.FromMinutes(2))
        {
            return new RunState(
                "Queued",
                12,
                null,
                run.Notes is null ? "The pipeline run has been queued." : $"Queued with notes: {run.Notes}",
                null,
                null
            );
        }

        if (age < TimeSpan.FromMinutes(8))
        {
            return new RunState(
                "Running",
                58,
                null,
                run.Notes is null ? "The pipeline run is in progress." : $"Running with notes: {run.Notes}",
                null,
                null
            );
        }

        return new RunState(
            "Succeeded",
            100,
            run.StartedAt.AddMinutes(8),
            run.Notes is null ? "The pipeline run finished successfully." : $"Completed run notes: {run.Notes}",
            null,
            null
        );
    }

    private static string BuildResultSummary(PipelineDefinition definition, int rowCount, string primaryMetricValue)
    {
        return rowCount > 0
            ? $"{rowCount:N0} scored rows available. {definition.PrimaryMetricLabel}: {primaryMetricValue}."
            : definition.ResultSummary;
    }

    private static string GetPrimaryMetricValue(PipelineDefinition definition, IReadOnlyList<string> headers, IEnumerable<string> dataLines)
    {
        if (headers.Count == 0 || string.IsNullOrWhiteSpace(definition.PrimaryMetricColumn))
        {
            return definition.Status;
        }

        var index = headers
            .Select((header, i) => new { header, i })
            .FirstOrDefault(item => item.header.Equals(definition.PrimaryMetricColumn, StringComparison.OrdinalIgnoreCase))?.i;

        if (index is null)
        {
            return definition.Status;
        }

        double? bestValue = null;
        foreach (var line in dataLines)
        {
            var columns = SplitCsvLine(line);
            if (index.Value >= columns.Count)
            {
                continue;
            }

            if (double.TryParse(columns[index.Value], System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var value) &&
                (bestValue is null || value > bestValue))
            {
                bestValue = value;
            }
        }

        return bestValue is null ? definition.Status : FormatMetric(bestValue.Value.ToString(System.Globalization.CultureInfo.InvariantCulture));
    }

    private static string FormatMetric(string raw)
    {
        if (double.TryParse(raw, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var value))
        {
            if (value is >= 0 and <= 1)
            {
                return $"{value:P1}";
            }

            return value.ToString("N1", System.Globalization.CultureInfo.InvariantCulture);
        }

        return raw;
    }

    private static List<string> SplitCsvLine(string line)
    {
        return line.Split(',').Select(part => part.Trim()).ToList();
    }

    private sealed record PipelineDefinition(
        string Key,
        string Name,
        string Domain,
        string Status,
        string Purpose,
        string NotebookPath,
        string OutputFileName,
        string PrimaryMetricLabel,
        string PrimaryMetricColumn,
        IReadOnlyList<string> Inputs,
        IReadOnlyList<string> Outputs,
        string ResultSummary)
    {
        public bool IsRunnable => !Status.Equals("Planned", StringComparison.OrdinalIgnoreCase);
    }

    private sealed record MlPipelineRunRecord(
        string RunId,
        string PipelineKey,
        DateTimeOffset StartedAt,
        string? Notes,
        string? StatusOverride = null,
        DateTimeOffset? CompletedAtOverride = null,
        string? ResultFileNameOverride = null,
        string? ResultSummaryOverride = null,
        int? ProgressOverride = null);

    private sealed record MlPipelineSnapshotData(
        string ResultSummary,
        string PrimaryMetricLabel,
        string PrimaryMetricValue,
        MlPipelineSnapshotDto Snapshot);

    private sealed record RunState(
        string Status,
        int ProgressPercent,
        DateTimeOffset? CompletedAt,
        string Message,
        string? ResultFileName,
        string? ResultSummary);
}
