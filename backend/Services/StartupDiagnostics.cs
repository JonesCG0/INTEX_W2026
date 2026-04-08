namespace backend.Services;

public sealed class StartupDiagnostics
{
    public bool HasStartupError => StartupException is not null;

    public string? Stage { get; private set; }
    public Exception? StartupException { get; private set; }
    public DateTimeOffset? OccurredAtUtc { get; private set; }

    public void Record(string stage, Exception exception)
    {
        Stage = stage;
        StartupException = exception;
        OccurredAtUtc = DateTimeOffset.UtcNow;
    }
}
