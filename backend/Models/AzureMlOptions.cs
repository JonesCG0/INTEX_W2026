namespace backend.Models;

public sealed class AzureMlOptions
{
    public string Mode { get; set; } = "Demo";
    public string? StudioUrl { get; set; }
    public string? WorkspaceName { get; set; }
    public string? ResourceGroup { get; set; }
    public string? SubscriptionId { get; set; }
    public string? OutputBlobContainerUrl { get; set; }
    public string OutputBlobPrefix { get; set; } = "generated_outputs";
    public string? EndpointUrl { get; set; }
    public string? EndpointAuthHeaderName { get; set; }
    public string? EndpointAuthHeaderValue { get; set; }
}
