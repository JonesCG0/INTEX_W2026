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

    [HttpPost("donors")]
    public async Task<ActionResult<AdminPortalDonorDto>> AddDonor([FromBody] CreateDonorRequestDto request)
    {
        try
        {
            return Ok(await store.AddDonorAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("donors/{id:int}")]
    public async Task<ActionResult<AdminPortalDonorDto>> UpdateDonor(int id, [FromBody] UpdateDonorRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateDonorAsync(id, request));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Donor not found." });
        }
    }

    [HttpDelete("donors/{id:int}")]
    public async Task<IActionResult> DeleteDonor(int id)
    {
        try
        {
            await store.DeleteDonorAsync(id);
            return NoContent();
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

    [HttpPut("contributions/{id:int}")]
    public async Task<ActionResult<AdminPortalContributionDto>> UpdateContribution(int id, [FromBody] UpdateContributionRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateContributionAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Contribution or donor not found." });
        }
    }

    [HttpDelete("contributions/{id:int}")]
    public async Task<IActionResult> DeleteContribution(int id)
    {
        try
        {
            await store.DeleteContributionAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Contribution not found." });
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

    [HttpGet("residents/{residentId:int}/recordings")]
    public async Task<ActionResult<IEnumerable<AdminPortalRecordingDto>>> GetRecordings(int residentId)
    {
        var overview = await store.GetOverviewAsync();
        var recordings = overview.Recordings.Where(recording => recording.ResidentId == residentId).ToArray();
        return Ok(new { recordings });
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

    [HttpPut("recordings/{id:int}")]
    public async Task<ActionResult<AdminPortalRecordingDto>> UpdateRecording(int id, [FromBody] UpdateRecordingRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateRecordingAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Recording or resident not found." });
        }
    }

    [HttpDelete("recordings/{id:int}")]
    public async Task<IActionResult> DeleteRecording(int id)
    {
        try
        {
            await store.DeleteRecordingAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Recording not found." });
        }
    }

    [HttpGet("residents/{residentId:int}/visitations")]
    public async Task<ActionResult<IEnumerable<AdminPortalVisitationDto>>> GetVisitations(int residentId)
    {
        var overview = await store.GetOverviewAsync();
        var visitations = overview.Visitations.Where(visitation => visitation.ResidentId == residentId).ToArray();
        return Ok(new { visitations });
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

    [HttpPut("visitations/{id:int}")]
    public async Task<ActionResult<AdminPortalVisitationDto>> UpdateVisitation(int id, [FromBody] UpdateVisitationRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateVisitationAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Visitation or resident not found." });
        }
    }

    [HttpDelete("visitations/{id:int}")]
    public async Task<IActionResult> DeleteVisitation(int id)
    {
        try
        {
            await store.DeleteVisitationAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Visitation not found." });
        }
    }
}
