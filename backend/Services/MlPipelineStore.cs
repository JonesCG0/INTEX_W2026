using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class MlPipelineStore
{
    private static readonly HttpClient HttpClient = new();
    private readonly AzureMlOptions _options;
    private readonly AzureMlJobClient _azureMlJobClient;
    private readonly string _repoRoot;
    private readonly string[] _outputRoots;
    private readonly List<PipelineDefinition> _definitions;
    private readonly List<MlPipelineRunRecord> _runs = [];
    private readonly object _gate = new();

    public MlPipelineStore(IOptions<AzureMlOptions> options, AzureMlJobClient azureMlJobClient, IWebHostEnvironment environment)
    {
        _options = options.Value;
        _azureMlJobClient = azureMlJobClient;
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
                Key: "donation-allocation-optimization",
                Name: "Donation allocation optimization",
                Domain: "Funding strategy",
                Status: "Ready",
                Purpose: "Rank safehouse-months by funding pressure and recommend allocation shares for the next cycle.",
                NotebookPath: "ml-pipelines/donation_allocation_optimization.ipynb",
                OutputFileName: string.Empty,
                PrimaryMetricLabel: "Run status",
                PrimaryMetricColumn: string.Empty,
                Inputs: ["safehouses", "residents", "incident_reports", "process_recordings", "intervention_plans"],
                Outputs: ["priority ranking", "recommended allocation share", "decision table"],
                ResultSummary: "Surfaces safehouse-months that need the strongest next-cycle funding attention."
            ),
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
                Inputs: ["supporters", "donations", "campaigns", "social_media_posts"],
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
                NotebookPath: "ml-pipelines/social_media_classification_commented.ipynb",
                OutputFileName: "social_media_planning_scores.csv",
                PrimaryMetricLabel: "Best conversion",
                PrimaryMetricColumn: "predicted_high_conversion_probability",
                Inputs: ["social_media_posts", "donations"],
                Outputs: ["content ranking", "conversion probability", "publish timing guidance"],
                ResultSummary: "Ranks planned posts so the team can favor high-conversion content and timing."
            ),
            new PipelineDefinition(
                Key: "education-outcome-prediction",
                Name: "Education outcome prediction",
                Domain: "Case management",
                Status: "Ready",
                Purpose: "Forecast next-month milestone progress for residents using education, attendance, and case context.",
                NotebookPath: "ml-pipelines/education_outcome_prediction.ipynb",
                OutputFileName: string.Empty,
                PrimaryMetricLabel: "Run status",
                PrimaryMetricColumn: string.Empty,
                Inputs: ["residents", "education_records", "process_recordings", "incident_reports", "health_wellbeing_records"],
                Outputs: ["scored resident-months", "milestone probability", "action list"],
                ResultSummary: "Scores resident-months for next-month milestone achievement planning."
            ),
            new PipelineDefinition(
                Key: "health-wellbeing-trajectory",
                Name: "Health and wellbeing trajectory",
                Domain: "Resident outcomes",
                Status: "Ready",
                Purpose: "Predict next-month health and wellbeing trajectory for active residents.",
                NotebookPath: "ml-pipelines/health_wellbeing_trajectory.ipynb",
                OutputFileName: string.Empty,
                PrimaryMetricLabel: "Run status",
                PrimaryMetricColumn: string.Empty,
                Inputs: ["residents", "health_wellbeing_records", "process_recordings", "incident_reports", "intervention_plans"],
                Outputs: ["resident scores", "trajectory prediction", "risk review table"],
                ResultSummary: "Scores residents by the likelihood of a positive next-month wellbeing trajectory."
            ),
            new PipelineDefinition(
                Key: "intervention-effectiveness",
                Name: "Intervention effectiveness",
                Domain: "Program evaluation",
                Status: "Ready",
                Purpose: "Rank intervention opportunities by predicted success and expose a staff-facing priority list.",
                NotebookPath: "ml-pipelines/intervention_effectiveness.ipynb",
                OutputFileName: string.Empty,
                PrimaryMetricLabel: "Run status",
                PrimaryMetricColumn: string.Empty,
                Inputs: ["residents", "intervention_plans", "process_recordings", "education_records", "health_wellbeing_records"],
                Outputs: ["priority list", "success probability", "intervention review table"],
                ResultSummary: "Ranks intervention opportunities so staff can focus on the most promising next steps."
            ),
            new PipelineDefinition(
                Key: "safehouse-performance-monitoring",
                Name: "Safehouse performance monitoring",
                Domain: "Operations",
                Status: "Ready",
                Purpose: "Flag safehouses that may need additional support by scoring monthly operational and resident-outcome metrics.",
                NotebookPath: "ml-pipelines/safehouse_performance_monitoring.ipynb",
                OutputFileName: "safehouse_performance_scores.csv",
                PrimaryMetricLabel: "Highest attention score",
                PrimaryMetricColumn: "safehouse_attention_probability",
                Inputs: ["safehouses", "residents", "process_recordings", "home_visitations", "education_records", "health_wellbeing_records", "incident_reports"],
                Outputs: ["attention flag", "monthly attention probability", "operational trend table"],
                ResultSummary: "Surfaces safehouses with deteriorating metrics so leadership can intervene early."
            ),
        ];
    }

    public async Task<MlPipelinesOverviewDto> GetOverviewAsync()
    {
        List<MlPipelineRunRecord> snapshotRuns;
        lock (_gate)
        {
            snapshotRuns = _definitions
                .SelectMany(BuildSnapshotRuns)
                .Concat(_runs)
                .OrderByDescending(run => run.StartedAt)
                .ToList();
        }

        var pipelines = new List<MlPipelineDto>(_definitions.Count);
        foreach (var definition in _definitions)
        {
            var snapshot = BuildSnapshot(definition);
            var recentRuns = await BuildRecentRunsAsync(
                snapshotRuns.Where(run => run.PipelineKey.Equals(definition.Key, StringComparison.OrdinalIgnoreCase))
                            .OrderByDescending(run => run.StartedAt)
                            .Take(3)).ConfigureAwait(false);

            pipelines.Add(new MlPipelineDto(
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
            ));
        }

        var recentDtos = await BuildRecentRunsAsync(snapshotRuns.OrderByDescending(run => run.StartedAt).Take(10)).ConfigureAwait(false);

        var canSubmitJobs = _azureMlJobClient.CanSubmitJobs(out _);

        return new MlPipelinesOverviewDto(
            new MlIntegrationDto(
                Mode: string.IsNullOrWhiteSpace(_options.Mode) ? "Demo" : _options.Mode.Trim(),
                StudioUrl: string.IsNullOrWhiteSpace(_options.StudioUrl) ? null : _options.StudioUrl.Trim(),
                WorkspaceName: string.IsNullOrWhiteSpace(_options.WorkspaceName) ? null : _options.WorkspaceName.Trim(),
                ResourceGroup: string.IsNullOrWhiteSpace(_options.ResourceGroup) ? null : _options.ResourceGroup.Trim(),
                SubscriptionId: string.IsNullOrWhiteSpace(_options.SubscriptionId) ? null : _options.SubscriptionId.Trim(),
                ComputeId: string.IsNullOrWhiteSpace(_options.ComputeId) ? null : _options.ComputeId.Trim(),
                CodeId: string.IsNullOrWhiteSpace(_options.CodeId) ? null : _options.CodeId.Trim(),
                EnvironmentId: string.IsNullOrWhiteSpace(_options.EnvironmentId) ? null : _options.EnvironmentId.Trim(),
                DataInputUri: string.IsNullOrWhiteSpace(_options.DataInputUri) ? null : _options.DataInputUri.Trim(),
                OutputDatastoreUri: string.IsNullOrWhiteSpace(_options.OutputDatastoreUri) ? null : _options.OutputDatastoreUri.Trim(),
                OutputBlobContainerUrl: string.IsNullOrWhiteSpace(_options.OutputBlobContainerUrl) ? null : _options.OutputBlobContainerUrl.Trim(),
                CanSubmitJobs: canSubmitJobs,
                StatusMessage: BuildStatusMessage()
            ),
            pipelines.ToArray(),
            recentDtos,
            DateTimeOffset.UtcNow
        );
    }

    public async Task<MlPipelineRunDto> StartRunAsync(string key, string? notes)
    {
        var definition = GetDefinition(key);
        if (!definition.IsRunnable)
        {
            throw new InvalidOperationException("This pipeline is planned and cannot be run yet.");
        }

        var run = string.Equals(_options.Mode, "AzureMl", StringComparison.OrdinalIgnoreCase)
            ? await SubmitAzureMlRunAsync(definition, notes).ConfigureAwait(false)
            : new MlPipelineRunRecord(
                RunId: Guid.NewGuid().ToString("N")[..12],
                PipelineKey: definition.Key,
                StartedAt: DateTimeOffset.UtcNow,
                Notes: string.IsNullOrWhiteSpace(notes) ? null : notes.Trim());

        lock (_gate)
        {
            _runs.Add(run);
        }

        return await BuildRunDtoAsync(run, definition.Name).ConfigureAwait(false);
    }

    public async Task<MlPipelineRunDto?> GetRunAsync(string key, string runId)
    {
        var definition = GetDefinition(key);
        MlPipelineRunRecord? run;
        lock (_gate)
        {
            run = _runs.FirstOrDefault(item =>
                item.PipelineKey.Equals(definition.Key, StringComparison.OrdinalIgnoreCase) &&
                item.RunId.Equals(runId, StringComparison.OrdinalIgnoreCase));
        }

        return run is null ? null : await BuildRunDtoAsync(run, definition.Name).ConfigureAwait(false);
    }

    private async Task<IReadOnlyList<MlPipelineRunDto>> BuildRecentRunsAsync(IEnumerable<MlPipelineRunRecord> runs)
    {
        var tasks = runs.Select(run =>
        {
            var definition = _definitions.First(item => item.Key.Equals(run.PipelineKey, StringComparison.OrdinalIgnoreCase));
            return BuildRunDtoAsync(run, definition.Name);
        });

        return await Task.WhenAll(tasks).ConfigureAwait(false);
    }

    private async Task<MlPipelineRunRecord> SubmitAzureMlRunAsync(PipelineDefinition definition, string? notes)
    {
        if (!_azureMlJobClient.CanSubmitJobs(out var missingMessage))
        {
            throw new InvalidOperationException($"Azure ML job submission is not configured. Missing: {missingMessage}");
        }

        var submission = await _azureMlJobClient.SubmitNotebookJobAsync(
            pipelineKey: definition.Key,
            displayName: definition.Name,
            notebookPath: definition.NotebookPath,
            outputFileName: definition.OutputFileName,
            notes: notes).ConfigureAwait(false);

        return new MlPipelineRunRecord(
            RunId: submission.JobName,
            PipelineKey: definition.Key,
            StartedAt: DateTimeOffset.UtcNow,
            Notes: string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            AzureJobName: submission.JobName,
            AzureJobStatus: submission.Status,
            AzureJobMessage: submission.Message
        );
    }

    private async Task<MlPipelineRunDto> BuildRunDtoAsync(MlPipelineRunRecord run, string pipelineName)
    {
        if (!string.IsNullOrWhiteSpace(run.AzureJobName) && string.Equals(_options.Mode, "AzureMl", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var jobState = await _azureMlJobClient.GetJobStateAsync(run.AzureJobName).ConfigureAwait(false);
                if (jobState is not null)
                {
                    var normalizedStatus = NormalizeState(jobState.Status);
                    var normalizedProgress = NormalizeProgress(jobState.Status);
                    var isCompleted = IsCompletedState(jobState.Status);
                    var definition = GetDefinition(run.PipelineKey);
                    var snapshot = isCompleted ? BuildSnapshot(definition) : null;

                    return new MlPipelineRunDto(
                        run.RunId,
                        run.PipelineKey,
                        pipelineName,
                        normalizedStatus,
                        normalizedProgress,
                        run.StartedAt,
                        isCompleted ? DateTimeOffset.UtcNow : null,
                        jobState.Message,
                        isCompleted ? definition.OutputFileName : null,
                        isCompleted ? snapshot?.ResultSummary ?? definition.ResultSummary : null
                    );
                }
            }
            catch
            {
                // Fall back to the stored run record if Azure ML status polling fails.
            }
        }

        return ToDto(run, pipelineName);
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
            if (!_azureMlJobClient.CanSubmitJobs(out var missing))
            {
                return $"Azure ML mode is enabled, but job submission is not configured yet. Missing: {missing}.";
            }

            return "Azure ML mode is enabled. The webapp can submit notebook jobs to the workspace and refresh the blob-backed outputs.";
        }

        return "Demo mode is enabled. The page shows the notebooks, current output snapshots, and simulated run history until Azure ML is connected.";
    }

    private static string NormalizeState(string state)
    {
        return state.ToLowerInvariant() switch
        {
            "notstarted" => "Queued",
            "queued" => "Queued",
            "running" => "Running",
            "preparing" => "Running",
            "finalizing" => "Running",
            "completed" => "Succeeded",
            "succeeded" => "Succeeded",
            "failed" => "Failed",
            "canceled" => "Canceled",
            "cancelrequested" => "Cancel requested",
            _ => state
        };
    }

    private static int NormalizeProgress(string state)
    {
        return state.ToLowerInvariant() switch
        {
            "notstarted" => 10,
            "queued" => 15,
            "running" => 60,
            "preparing" => 30,
            "finalizing" => 90,
            "completed" => 100,
            "succeeded" => 100,
            "failed" => 100,
            "canceled" => 100,
            "cancelrequested" => 50,
            _ => 50
        };
    }

    private static bool IsCompletedState(string state)
    {
        return state.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
               state.Equals("Succeeded", StringComparison.OrdinalIgnoreCase);
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

        var snapshotSource = ResolveOutputSource(definition.OutputFileName);
        if (snapshotSource is null)
        {
            return new MlPipelineSnapshotData(
                ResultSummary: definition.ResultSummary,
                PrimaryMetricLabel: definition.PrimaryMetricLabel,
                PrimaryMetricValue: definition.Status,
                Snapshot: new MlPipelineSnapshotDto(definition.OutputFileName, null, 0, [], [])
            );
        }

        var lines = snapshotSource.Content
            .Split(["\r\n", "\n"], StringSplitOptions.None);
        if (lines.Length == 0)
        {
            return new MlPipelineSnapshotData(
                ResultSummary: definition.ResultSummary,
                PrimaryMetricLabel: definition.PrimaryMetricLabel,
                PrimaryMetricValue: definition.Status,
                Snapshot: new MlPipelineSnapshotDto(definition.OutputFileName, snapshotSource.LastModifiedUtc?.ToString("u"), 0, [], [])
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
                snapshotSource.LastModifiedUtc?.ToString("u"),
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

        var snapshotSource = ResolveOutputSource(definition.OutputFileName);
        if (snapshotSource is null)
        {
            yield break;
        }

        var snapshot = BuildSnapshot(definition);
        var lastModifiedUtc = snapshotSource.LastModifiedUtc ?? DateTimeOffset.UtcNow;

        yield return new MlPipelineRunRecord(
            RunId: $"snapshot-{definition.Key}",
            PipelineKey: definition.Key,
            StartedAt: lastModifiedUtc,
            Notes: "Snapshot loaded from generated_outputs",
            StatusOverride: "Succeeded",
            CompletedAtOverride: lastModifiedUtc,
            ResultFileNameOverride: definition.OutputFileName,
            ResultSummaryOverride: snapshot.ResultSummary,
            ProgressOverride: 100
        );
    }

    private SnapshotSource? ResolveOutputSource(string fileName)
    {
        var blobSource = TryReadBlobSnapshot(fileName);
        if (blobSource is not null)
        {
            return blobSource;
        }

        foreach (var outputRoot in _outputRoots)
        {
            var candidate = Path.Combine(outputRoot, fileName);
            if (File.Exists(candidate))
            {
                return new SnapshotSource(
                    FileName: fileName,
                    Content: File.ReadAllText(candidate),
                    LastModifiedUtc: File.GetLastWriteTimeUtc(candidate)
                );
            }
        }

        return null;
    }

    private SnapshotSource? TryReadBlobSnapshot(string fileName)
    {
        if (string.IsNullOrWhiteSpace(_options.OutputBlobContainerUrl))
        {
            return null;
        }

        var containerUrl = _options.OutputBlobContainerUrl.Trim().TrimEnd('/');
        var prefix = _options.OutputBlobPrefix.Trim().Trim('/');

        var candidateUrls = new[]
        {
            CombineBlobUrl(containerUrl, prefix, fileName),
            CombineBlobUrl(containerUrl, fileName),
        };

        foreach (var url in candidateUrls)
        {
            try
            {
                using var response = HttpClient.GetAsync(url).GetAwaiter().GetResult();
                if (!response.IsSuccessStatusCode)
                {
                    continue;
                }

                var content = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var lastModified = response.Content.Headers.LastModified;

                return new SnapshotSource(
                    FileName: fileName,
                    Content: content,
                    LastModifiedUtc: lastModified
                );
            }
            catch
            {
                // Fall back to local files if the blob path is unavailable or unauthorized.
            }
        }

        return null;
    }

    private static string CombineBlobUrl(string baseUrl, params string[] segments)
    {
        var uri = new Uri(baseUrl, UriKind.Absolute);
        var path = uri.AbsolutePath.TrimEnd('/');
        foreach (var segment in segments)
        {
            if (!string.IsNullOrWhiteSpace(segment))
            {
                path = $"{path}/{Uri.EscapeDataString(segment.Trim('/'))}";
            }
        }

        var builder = new UriBuilder(uri)
        {
            Path = path
        };

        return builder.Uri.ToString();
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
        if (!string.IsNullOrWhiteSpace(run.AzureJobStatus))
        {
            return new RunState(
                NormalizeState(run.AzureJobStatus),
                NormalizeProgress(run.AzureJobStatus),
                IsCompletedState(run.AzureJobStatus) ? run.StartedAt.AddMinutes(8) : null,
                string.IsNullOrWhiteSpace(run.AzureJobMessage)
                    ? $"Azure ML job status: {run.AzureJobStatus}."
                    : run.AzureJobMessage,
                null,
                null
            );
        }

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
        string? AzureJobName = null,
        string? AzureJobStatus = null,
        string? AzureJobMessage = null,
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

    private sealed record SnapshotSource(
        string FileName,
        string Content,
        DateTimeOffset? LastModifiedUtc);

    private sealed record RunState(
        string Status,
        int ProgressPercent,
        DateTimeOffset? CompletedAt,
        string Message,
        string? ResultFileName,
        string? ResultSummary);
}
