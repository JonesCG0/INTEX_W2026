namespace backend.Services;

public sealed class StartupDiagnostics
{
    private readonly object _gate = new();
    private readonly List<StartupCheckpoint> _checkpoints = [];

    public bool HasStartupError => StartupException is not null;
    public string? Stage { get; private set; }
    public Exception? StartupException { get; private set; }
    public DateTimeOffset? OccurredAtUtc { get; private set; }
    public IReadOnlyList<StartupCheckpoint> Checkpoints
    {
        get
        {
            lock (_gate)
            {
                return _checkpoints.ToArray();
            }
        }
    }

    public void Record(string stage, Exception exception)
    {
        Stage = stage;
        StartupException = exception;
        OccurredAtUtc = DateTimeOffset.UtcNow;
        AddCheckpoint(stage, "failed", exception.GetBaseException().Message, exception.GetType().FullName);
    }

    public void RecordCheckpoint(string stage, string status, string? message = null)
    {
        AddCheckpoint(stage, status, message);
    }

    private void AddCheckpoint(string stage, string status, string? message, string? exceptionType = null)
    {
        lock (_gate)
        {
            _checkpoints.Add(new StartupCheckpoint(stage, status, message, exceptionType, DateTimeOffset.UtcNow));
        }
    }
}

public sealed record StartupCheckpoint(
    string Stage,
    string Status,
    string? Message,
    string? ExceptionType,
    DateTimeOffset OccurredAtUtc);
