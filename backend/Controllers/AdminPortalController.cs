using backend.Models.AdminPortal;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/portal")]
[Authorize(Roles = "Admin")]
public class AdminPortalController(AdminPortalStore store) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminPortalOverviewDto>> GetOverview()
    {
        return Ok(await store.GetOverviewAsync());
    }

    [HttpPut("donors/{id:int}")]
    public async Task<ActionResult<AdminPortalDonorDto>> UpdateDonor(int id, [FromBody] UpdateDonorRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateDonorAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Donor not found." });
        }
    }

    [HttpPost("donors/{id:int}/contributions")]
    public async Task<ActionResult<AdminPortalContributionDto>> AddContribution(int id, [FromBody] CreateContributionRequestDto request)
    {
        try
        {
            return Ok(await store.AddContributionAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Donor not found." });
        }
    }

    [HttpPost("residents")]
    public async Task<ActionResult<AdminPortalResidentDto>> AddResident([FromBody] CreateResidentRequestDto request)
    {
        return Ok(await store.AddResidentAsync(request));
    }

    [HttpPut("residents/{id:int}")]
    public async Task<ActionResult<AdminPortalResidentDto>> UpdateResident(int id, [FromBody] UpdateResidentRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateResidentAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Resident not found." });
        }
    }

    [HttpDelete("residents/{id:int}")]
    public async Task<IActionResult> DeleteResident(int id)
    {
        try
        {
            await store.DeleteResidentAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Resident not found." });
        }
    }

    [HttpPost("recordings")]
    public async Task<ActionResult<AdminPortalRecordingDto>> AddRecording([FromBody] CreateRecordingRequestDto request)
    {
        try
        {
            return Ok(await store.AddRecordingAsync(request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Resident not found." });
        }
    }

    [HttpPost("visitations")]
    public async Task<ActionResult<AdminPortalVisitationDto>> AddVisitation([FromBody] CreateVisitationRequestDto request)
    {
        try
        {
            return Ok(await store.AddVisitationAsync(request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Resident not found." });
        }
    }
}
