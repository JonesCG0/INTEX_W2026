using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/ml/pipelines")]
public sealed class MlPipelinesController(MlPipelineStore store) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<MlPipelinesOverviewDto>> GetOverview()
    {
        return Ok(await store.GetOverviewAsync());
    }

    [HttpPost("{key}/runs")]
    public async Task<ActionResult<MlPipelineRunDto>> StartRun(string key, [FromBody] StartMlPipelineRunRequestDto request)
    {
        try
        {
            var run = await store.StartRunAsync(key, request.Notes);
            return Ok(run);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Pipeline not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpGet("{key}/runs/{runId}")]
    public async Task<ActionResult<MlPipelineRunDto>> GetRun(string key, string runId)
    {
        try
        {
            var run = await store.GetRunAsync(key, runId);
            return run is null ? NotFound(new { error = "Run not found." }) : Ok(run);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Pipeline not found." });
        }
    }
}
