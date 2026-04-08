using System.Data.Common;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class HealthController(AppDbContext db, StartupDiagnostics startupDiagnostics, IWebHostEnvironment environment) : ControllerBase
{
    // GET /api/health - checks backend, startup, and database connectivity
    [HttpGet("health")]
    public async Task<IActionResult> Health([FromQuery] bool details = false)
    {
        var dbConnected = false;
        InvalidOperationException? invalidOperationException = null;
        DbException? dbException = null;

        try
        {
            dbConnected = await db.Database.CanConnectAsync();
        }
        catch (InvalidOperationException ex)
        {
            dbConnected = false;
            invalidOperationException = ex;
        }
        catch (DbException ex)
        {
            dbConnected = false;
            dbException = ex;
        }

        var hasStartupError = startupDiagnostics.HasStartupError;
        var status = hasStartupError || !dbConnected ? "degraded" : "ok";

        var response = new
        {
            status,
            timestamp = DateTime.UtcNow,
            startup = hasStartupError
                ? new
                {
                    error = startupDiagnostics.StartupException?.GetBaseException().Message,
                    exceptionType = startupDiagnostics.StartupException?.GetType().FullName,
                    stage = startupDiagnostics.Stage,
                    occurredAtUtc = startupDiagnostics.OccurredAtUtc
                }
                : null,
            database = dbConnected ? "connected" : "unavailable",
            databaseError = details && environment.IsDevelopment()
                ? invalidOperationException?.Message ?? dbException?.Message
                : null
        };

        return hasStartupError || !dbConnected
            ? StatusCode(StatusCodes.Status503ServiceUnavailable, response)
            : Ok(response);
    }

    // GET /api/message - sample JSON endpoint
    [HttpGet("message")]
    public IActionResult Message()
    {
        return Ok(new { message = "Hello from the ASP.NET backend!" });
    }
}
