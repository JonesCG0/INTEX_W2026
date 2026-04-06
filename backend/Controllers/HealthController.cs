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
        try
        {
            using var conn = new Microsoft.Data.SqlClient.SqlConnection(connString);
            await conn.OpenAsync();
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow, database = "connected" });
        }
        catch (Exception ex)
        {
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow, database = "error", error = ex.Message });
        }
    }

    // GET /api/message — sample JSON endpoint
    [HttpGet("message")]
    public IActionResult Message()
    {
        return Ok(new { message = "Hello from the ASP.NET backend!" });
    }
}
