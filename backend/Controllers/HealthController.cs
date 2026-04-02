using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    // GET /api/health — used by frontend to confirm backend is reachable
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
    }

    // GET /api/message — sample JSON endpoint
    [HttpGet("message")]
    public IActionResult Message()
    {
        return Ok(new { message = "Hello from the ASP.NET backend!" });
    }
}
