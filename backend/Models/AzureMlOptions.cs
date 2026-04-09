namespace backend.Models;

public sealed class AzureMlOptions
{
    public string Mode { get; set; } = "Demo";
    public string? StudioUrl { get; set; }
    public string? WorkspaceName { get; set; }
    public string? ResourceGroup { get; set; }
    public string? SubscriptionId { get; set; }
    public string? ExperimentName { get; set; }
    public string? ComputeId { get; set; }
    public string? CodeId { get; set; }
    public string? EnvironmentId { get; set; }
    public string? DataInputUri { get; set; }
    public string? OutputDatastoreUri { get; set; }
    public string? OutputBlobContainerUrl { get; set; }
    public string OutputBlobPrefix { get; set; } = "generated_outputs";
    public string RunnerScriptPath { get; set; } = "run_notebook_job.py";
    public string JobApiVersion { get; set; } = "2025-09-01";
    public string? EndpointUrl { get; set; }
    public string? EndpointAuthHeaderName { get; set; }
    public string? EndpointAuthHeaderValue { get; set; }
}
