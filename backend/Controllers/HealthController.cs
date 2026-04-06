using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class HealthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    // GET /api/health — checks backend and database connectivity
    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        var connString = config.GetConnectionString("DefaultConnection");
        var hasConn = !string.IsNullOrEmpty(connString);
        try
        {
            var dbConnected = await db.Database.CanConnectAsync();
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow, database = dbConnected ? "connected" : "unavailable", hasConnectionString = hasConn });
        }
        catch (Exception ex)
        {
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow, database = "error", hasConnectionString = hasConn, error = ex.Message });
        }
    }

    // GET /api/message — sample JSON endpoint
    [HttpGet("message")]
    public IActionResult Message()
    {
        return Ok(new { message = "Hello from the ASP.NET backend!" });
    }
}
