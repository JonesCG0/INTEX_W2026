using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class HealthController(AppDbContext db) : ControllerBase
{
    // GET /api/health — checks backend and database connectivity
    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        var dbConnected = await db.Database.CanConnectAsync();
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow, database = dbConnected ? "connected" : "unavailable" });
    }

    // GET /api/message — sample JSON endpoint
    [HttpGet("message")]
    public IActionResult Message()
    {
        return Ok(new { message = "Hello from the ASP.NET backend!" });
    }
}
