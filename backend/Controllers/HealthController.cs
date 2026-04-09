using System.Data.Common;
using System.Reflection;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/health")]
[AllowAnonymous]
public class HealthController(AppDbContext db, StartupDiagnostics startupDiagnostics, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Ready([FromQuery] bool details = false)
    {
        var snapshot = await BuildReadinessSnapshotAsync(details);
        return snapshot.IsHealthy
            ? Ok(snapshot.Response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, snapshot.Response);
    }

    [HttpGet("ready")]
    public async Task<IActionResult> ReadyEndpoint([FromQuery] bool details = false) => await Ready(details);

    [HttpGet("live")]
    public IActionResult Live()
    {
        return Ok(new
        {
            status = "ok",
            timestamp = DateTime.UtcNow,
            environment = environment.EnvironmentName,
            appVersion = Assembly.GetEntryAssembly()?.GetName().Version?.ToString(),
            requestId = HttpContext.TraceIdentifier
        });
    }

    [HttpGet("full")]
    public async Task<IActionResult> Full([FromQuery] bool details = false) => await Ready(details);

    [HttpGet("diagnostics")]
    public async Task<IActionResult> GetDiagnostics()
    {
        var donorEmail = "donor@example.com";
        var supporter = await db.Supporters.Include(s => s.Donations).FirstOrDefaultAsync(s => s.Email == donorEmail);
        
        var stats = new
        {
            Time = DateTime.UtcNow,
            Snapshots = await db.PublicImpactSnapshots.CountAsync(),
            Metrics = await db.SafehouseMonthlyMetrics.CountAsync(),
            SupporterFound = supporter != null,
            SupporterId = supporter?.SupporterId,
            DonationCount = supporter?.Donations?.Count ?? 0,
            AllDonations = await db.Donations.CountAsync()
        };
        
        return Ok(stats);
    }


    private async Task<HealthSnapshot> BuildReadinessSnapshotAsync(bool details)
    {
        var dbConnected = false;
        var dbElapsedMs = 0L;
        InvalidOperationException? invalidOperationException = null;
        DbException? dbException = null;

        try
        {
            var dbStart = DateTime.UtcNow;
            dbConnected = await db.Database.CanConnectAsync();
            dbElapsedMs = (long)(DateTime.UtcNow - dbStart).TotalMilliseconds;
        }
        catch (InvalidOperationException ex)
        {
            invalidOperationException = ex;
        }
        catch (DbException ex)
        {
            dbException = ex;
        }

        var hasStartupError = startupDiagnostics.HasStartupError;
        var status = hasStartupError || !dbConnected ? "degraded" : "ok";
        var components = new object[]
        {
            new
            {
                name = "startup",
                status = hasStartupError ? "failed" : "ok",
                detail = hasStartupError ? startupDiagnostics.Stage : "bootstrap complete",
                error = hasStartupError ? startupDiagnostics.StartupException?.GetBaseException().Message : null,
                exceptionType = details ? startupDiagnostics.StartupException?.GetType().FullName : null,
                occurredAtUtc = details ? startupDiagnostics.OccurredAtUtc : null
            },
            new
            {
                name = "database",
                status = dbConnected ? "connected" : "unavailable",
                detail = dbConnected ? "database connectivity verified" : "database connectivity failed",
                error = details ? invalidOperationException?.Message ?? dbException?.Message : null,
                elapsedMs = details ? (long?)dbElapsedMs : null
            }
        };

        var response = new
        {
            status,
            timestamp = DateTime.UtcNow,
            environment = environment.EnvironmentName,
            appVersion = Assembly.GetEntryAssembly()?.GetName().Version?.ToString(),
            requestId = HttpContext.TraceIdentifier,
            startup = hasStartupError
                ? new
                {
                    error = startupDiagnostics.StartupException?.GetBaseException().Message,
                    exceptionType = startupDiagnostics.StartupException?.GetType().FullName,
                    stage = startupDiagnostics.Stage,
                    occurredAtUtc = startupDiagnostics.OccurredAtUtc,
                    checkpoints = details ? startupDiagnostics.Checkpoints : Array.Empty<StartupCheckpoint>()
                }
                : null,
            database = dbConnected ? "connected" : "unavailable",
            databaseError = details && environment.IsDevelopment()
                ? invalidOperationException?.Message ?? dbException?.Message
                : null,
            components = details ? components : Array.Empty<object>()
        };

        return new HealthSnapshot(!hasStartupError && dbConnected, response);
    }

    private sealed record HealthSnapshot(bool IsHealthy, object Response);
}
