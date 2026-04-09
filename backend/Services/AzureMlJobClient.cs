using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Azure.Core;
using Azure.Identity;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class AzureMlJobClient
{
    private static readonly HttpClient HttpClient = new();
    private readonly AzureMlOptions _options;
    private readonly TokenCredential _credential = new DefaultAzureCredential();

    public AzureMlJobClient(IOptions<AzureMlOptions> options)
    {
        _options = options.Value;
    }

    public bool CanSubmitJobs(out string missingSettings)
    {
        var missing = new List<string>();

        if (string.IsNullOrWhiteSpace(_options.SubscriptionId))
        {
            missing.Add("SubscriptionId");
        }

        if (string.IsNullOrWhiteSpace(_options.ResourceGroup))
        {
            missing.Add("ResourceGroup");
        }

        if (string.IsNullOrWhiteSpace(_options.WorkspaceName))
        {
            missing.Add("WorkspaceName");
        }

        if (string.IsNullOrWhiteSpace(_options.ComputeId))
        {
            missing.Add("ComputeId");
        }

        if (string.IsNullOrWhiteSpace(_options.CodeId))
        {
            missing.Add("CodeId");
        }

        if (string.IsNullOrWhiteSpace(_options.EnvironmentId))
        {
            missing.Add("EnvironmentId");
        }

        if (string.IsNullOrWhiteSpace(_options.DataInputUri))
        {
            missing.Add("DataInputUri");
        }

        if (string.IsNullOrWhiteSpace(_options.OutputDatastoreUri))
        {
            missing.Add("OutputDatastoreUri");
        }

        missingSettings = missing.Count == 0
            ? string.Empty
            : string.Join(", ", missing);

        return missing.Count == 0;
    }

    public async Task<AzureMlJobSubmissionResult> SubmitNotebookJobAsync(
        string pipelineKey,
        string displayName,
        string notebookPath,
        string outputFileName,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var jobName = MakeJobName(pipelineKey);
        var notebookFileName = Path.GetFileName(notebookPath);
        var dataUri = _options.DataInputUri!.Trim();
        var outputUri = _options.OutputDatastoreUri!.Trim();
        var runnerScript = string.IsNullOrWhiteSpace(_options.RunnerScriptPath)
            ? "run_notebook_job.py"
            : _options.RunnerScriptPath.Trim().Replace('\\', '/');

        var command = "python " + runnerScript
            + " --notebook \"" + notebookFileName + "\""
            + " --data-dir ${{inputs.data}}"
            + " --output-dir ${{outputs.generated_outputs}}";

        var requestBody = new
        {
            properties = new
            {
                displayName = displayName,
                experimentName = string.IsNullOrWhiteSpace(_options.ExperimentName)
                    ? "ProjectHaven"
                    : _options.ExperimentName.Trim(),
                computeId = _options.ComputeId!.Trim(),
                jobType = "Command",
                codeId = _options.CodeId!.Trim(),
                command,
                environmentId = _options.EnvironmentId!.Trim(),
                resources = new
                {
                    instanceCount = 1
                },
                inputs = new Dictionary<string, object?>
                {
                    ["data"] = new
                    {
                        jobInputType = "uri_folder",
                        mode = "ReadOnlyMount",
                        uri = dataUri
                    }
                },
                outputs = new Dictionary<string, object?>
                {
                    ["generated_outputs"] = new
                    {
                        jobOutputType = "uri_folder",
                        mode = "ReadWriteMount",
                        uri = outputUri
                    }
                },
                environmentVariables = new Dictionary<string, string>
                {
                    ["AZUREML_OUTPUT_DIR"] = "${{outputs.generated_outputs}}",
                    ["PROJECT_HAVEN_PIPELINE_KEY"] = pipelineKey,
                    ["PROJECT_HAVEN_OUTPUT_FILE"] = outputFileName,
                    ["PROJECT_HAVEN_NOTES"] = notes ?? string.Empty
                }
            }
        };

        var requestUrl = BuildJobsUrl(jobName);
        var accessToken = await GetAccessTokenAsync(cancellationToken).ConfigureAwait(false);
        using var request = new HttpRequestMessage(HttpMethod.Put, requestUrl)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody, new JsonSerializerOptions(JsonSerializerDefaults.Web)), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await HttpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Azure ML job submission failed with {(int)response.StatusCode} {response.ReasonPhrase}: {responseContent}");
        }

        var state = ParseJobState(responseContent);
        return new AzureMlJobSubmissionResult(
            JobName: jobName,
            Status: state?.Status ?? "Queued",
            Message: state?.Message ?? "Azure ML job submission accepted."
        );
    }

    public async Task<AzureMlJobState?> GetJobStateAsync(string jobName, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var requestUrl = BuildJobsUrl(jobName);
        var accessToken = await GetAccessTokenAsync(cancellationToken).ConfigureAwait(false);
        using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await HttpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Azure ML job lookup failed with {(int)response.StatusCode} {response.ReasonPhrase}: {responseContent}");
        }

        return ParseJobState(responseContent);
    }

    private void EnsureConfigured()
    {
        if (!CanSubmitJobs(out var missing))
        {
            throw new InvalidOperationException($"Azure ML job submission is not configured. Missing: {missing}");
        }
    }

    private string BuildJobsUrl(string jobName)
    {
        return
            $"https://management.azure.com/subscriptions/{Uri.EscapeDataString(_options.SubscriptionId!.Trim())}" +
            $"/resourceGroups/{Uri.EscapeDataString(_options.ResourceGroup!.Trim())}" +
            $"/providers/Microsoft.MachineLearningServices/workspaces/{Uri.EscapeDataString(_options.WorkspaceName!.Trim())}" +
            $"/jobs/{Uri.EscapeDataString(jobName)}?api-version={Uri.EscapeDataString(GetApiVersion())}";
    }

    private string GetApiVersion()
    {
        return string.IsNullOrWhiteSpace(_options.JobApiVersion)
            ? "2025-09-01"
            : _options.JobApiVersion.Trim();
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var token = await _credential.GetTokenAsync(
            new TokenRequestContext(["https://management.azure.com/.default"]),
            cancellationToken).ConfigureAwait(false);

        return token.Token;
    }

    private static string MakeJobName(string pipelineKey)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var timestamp = DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss");
        var candidate = $"{pipelineKey}-{timestamp}-{suffix}".ToLowerInvariant();
        return candidate.Length <= 255 ? candidate : candidate[..255];
    }

    private static AzureMlJobState? ParseJobState(string json)
    {
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        if (!root.TryGetProperty("properties", out var properties))
        {
            return null;
        }

        var status = GetString(properties, "status") ?? "Unknown";
        var displayName = GetString(properties, "displayName");
        var experimentName = GetString(properties, "experimentName");
        var message = BuildMessage(status, displayName, experimentName);
        return new AzureMlJobState(status, message);
    }

    private static string? GetString(JsonElement element, string name)
    {
        return element.TryGetProperty(name, out var child) && child.ValueKind == JsonValueKind.String
            ? child.GetString()
            : null;
    }

    private static string BuildMessage(string status, string? displayName, string? experimentName)
    {
        return status.ToLowerInvariant() switch
        {
            "notstarted" => $"Azure ML job '{displayName ?? "pipeline"}' is waiting to start.",
            "queued" => $"Azure ML job '{displayName ?? "pipeline"}' is queued.",
            "running" => $"Azure ML job '{displayName ?? "pipeline"}' is running.",
            "finalizing" => $"Azure ML job '{displayName ?? "pipeline"}' is finalizing output collection.",
            "completed" => $"Azure ML job '{displayName ?? "pipeline"}' completed successfully.",
            "failed" => $"Azure ML job '{displayName ?? "pipeline"}' failed.",
            "canceled" => $"Azure ML job '{displayName ?? "pipeline"}' was canceled.",
            "cancelrequested" => $"Azure ML job '{displayName ?? "pipeline"}' cancellation was requested.",
            _ => string.IsNullOrWhiteSpace(experimentName)
                ? $"Azure ML job status: {status}."
                : $"Azure ML job status: {status} in experiment '{experimentName}'."
        };
    }
}

public sealed record AzureMlJobSubmissionResult(
    string JobName,
    string Status,
    string Message);

public sealed record AzureMlJobState(
    string Status,
    string Message);
