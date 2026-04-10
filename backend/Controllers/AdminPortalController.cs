using System.Security.Claims;
using backend.Models.AdminPortal;
using backend.Security;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// Admin-only CRUD endpoints for the admin portal (donors, contributions, residents, recordings, visitations, conferences).
[ApiController]
[Route("api/admin/portal")]
[Authorize(Roles = "Admin")]
public class AdminPortalController(CanonicalAdminPortalStore store, ILogger<AdminPortalController> logger) : ControllerBase
{
    // GET /api/admin/portal — returns a full overview of all portal data.
    [HttpGet]
    public async Task<ActionResult<AdminPortalOverviewDto>> GetOverview()
    {
        return Ok(await store.GetOverviewAsync());
    }

    // GET /api/admin/portal/social-posts — returns social posts, optionally filtered by platform or campaign.
    [HttpGet("social-posts")]
    public async Task<ActionResult<IReadOnlyList<AdminPortalSocialPostDto>>> GetSocialPosts([FromQuery] string? platform = null, [FromQuery] string? campaign = null)
    {
        return Ok(await store.GetSocialPostsAsync(platform, campaign));
    }

    [HttpGet("donor-relationship-okrs")]
    public async Task<ActionResult<DonorRelationshipOkrsDto>> GetDonorRelationshipOkrs()
    {
        return Ok(await store.GetDonorRelationshipOkrsAsync());
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
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteDonorAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted donor {DonorId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
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
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteContributionAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted contribution {ContributionId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
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
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteResidentAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted resident {ResidentId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
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
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteRecordingAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted recording {RecordingId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
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
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteVisitationAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted visitation {VisitationId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Visitation not found." });
        }
    }

    [HttpPost("conferences")]
    public async Task<ActionResult<AdminPortalConferenceDto>> AddConference([FromBody] CreateConferenceRequestDto request)
    {
        try
        {
            return Ok(await store.AddConferenceAsync(request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Resident not found." });
        }
    }

    [HttpPut("conferences/{id:int}")]
    public async Task<ActionResult<AdminPortalConferenceDto>> UpdateConference(int id, [FromBody] UpdateConferenceRequestDto request)
    {
        try
        {
            return Ok(await store.UpdateConferenceAsync(id, request));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("conferences/{id:int}")]
    public async Task<IActionResult> DeleteConference(int id)
    {
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        try
        {
            await store.DeleteConferenceAsync(id);
            logger.LogWarning("Admin user {ActorUserId} deleted conference plan {PlanId}.", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "unknown", id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Conference plan not found." });
        }
    }

    private IActionResult? RequireConfirmedDelete()
    {
        if (AdminDeleteProtection.IsConfirmed(Request))
        {
            return null;
        }

        return StatusCode(StatusCodes.Status428PreconditionRequired, new
        {
            error = $"Send {AdminDeleteProtection.HeaderName}: {AdminDeleteProtection.RequiredValue} to confirm this delete action."
        });
    }
}
