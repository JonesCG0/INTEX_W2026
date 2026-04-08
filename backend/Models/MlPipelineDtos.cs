namespace backend.Models;

public sealed record MlPipelinesOverviewDto(
    MlIntegrationDto Integration,
    IReadOnlyList<MlPipelineDto> Pipelines,
    IReadOnlyList<MlPipelineRunDto> RecentRuns,
    DateTimeOffset GeneratedAt
);

public sealed record MlIntegrationDto(
    string Mode,
    string? StudioUrl,
    string? WorkspaceName,
    string? ResourceGroup,
    string? SubscriptionId,
    string StatusMessage
);

public sealed record MlPipelineDto(
    string Key,
    string Name,
    string Domain,
    string Status,
    string Purpose,
    string NotebookPath,
    string OutputFileName,
    string PrimaryMetricLabel,
    string PrimaryMetricValue,
    string ResultSummary,
    IReadOnlyList<string> Inputs,
    IReadOnlyList<string> Outputs,
    MlPipelineSnapshotDto Snapshot,
    IReadOnlyList<MlPipelineRunDto> RecentRuns
);

public sealed record MlPipelineSnapshotDto(
    string? FileName,
    string? LastModifiedAt,
    int RowCount,
    IReadOnlyList<string> Headers,
    IReadOnlyList<IReadOnlyList<string>> PreviewRows
);

public sealed record MlPipelineRunDto(
    string RunId,
    string PipelineKey,
    string PipelineName,
    string Status,
    int ProgressPercent,
    DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt,
    string Message,
    string? ResultFileName,
    string? ResultSummary
);

public sealed record StartMlPipelineRunRequestDto(
    string? Notes
);
