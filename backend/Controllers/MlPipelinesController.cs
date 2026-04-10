using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// Admin-only endpoints for viewing and triggering ML pipeline runs.
[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/ml/pipelines")]
public sealed class MlPipelinesController(MlPipelineStore store) : ControllerBase
{
    // GET /api/ml/pipelines — returns all pipeline definitions, their latest snapshots, and recent runs.
    [HttpGet]
    public async Task<ActionResult<MlPipelinesOverviewDto>> GetOverview()
    {
        try
        {
            return Ok(await store.GetOverviewAsync());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = ex.GetBaseException().Message
            });
        }
    }

    // POST /api/ml/pipelines/{key}/runs — starts a new run for the given pipeline (demo or Azure ML).
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
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = ex.GetBaseException().Message
            });
        }
    }

    // GET /api/ml/pipelines/{key}/runs/{runId} — polls the status of a specific run.
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
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = ex.GetBaseException().Message
            });
        }
    }
}
