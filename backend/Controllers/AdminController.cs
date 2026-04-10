using System.Data.Common;
using backend.Data;
using backend.Models;
using backend.Models.Admin;
using backend.Security;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

// Admin-only endpoints for managing users and running read-only database queries.
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    AppDbContext db,
    SupporterProfileService supporterProfiles,
    ILogger<AdminController> logger) : ControllerBase
{
    // ── User Management ────────────────────────────────────────────────────

    // GET /api/admin/users — returns all users sorted by email.
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserSummaryDto>>> GetUsers()
    {
        var users = await userManager.Users.OrderBy(u => u.Email).ToListAsync();

        var result = new List<UserSummaryDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            result.Add(new UserSummaryDto(
                user.Id,
                user.Email ?? string.Empty,
                user.DisplayName,
                roles.FirstOrDefault() ?? "—",
                user.LockoutEnabled,
                user.LockoutEnd,
                user.AccessFailedCount
            ));
        }

        return Ok(result);
    }

    // POST /api/admin/users — creates a new user with the specified role.
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto dto)
    {
        var allowed = new[] { "Admin", "Donor" };
        if (!allowed.Contains(dto.Role))
        {
            return BadRequest(new { error = $"Role must be one of: {string.Join(", ", allowed)}." });
        }

        var existing = await userManager.FindByEmailAsync(dto.Email.Trim());
        if (existing is not null)
        {
            return Conflict(new { error = "A user with that email already exists." });
        }

        var user = new AppUser
        {
            UserName = dto.Email.Trim(),
            Email = dto.Email.Trim(),
            DisplayName = dto.DisplayName.Trim(),
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return StatusCode(500, new { error = result.Errors.FirstOrDefault()?.Description ?? "User creation failed." });
        }

        await userManager.AddToRoleAsync(user, dto.Role);
        if (dto.Role == "Donor")
        {
            await EnsureDonorProfileAsync(user.Email!, user.DisplayName);
        }

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, new { user.Id, user.Email, user.DisplayName, dto.Role });
    }

    // PUT /api/admin/users/{id} — updates a user's display name and role.
    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto dto)
    {
        var allowed = new[] { "Admin", "Donor" };
        if (!allowed.Contains(dto.Role))
        {
            return BadRequest(new { error = $"Role must be one of: {string.Join(", ", allowed)}." });
        }

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound(new { error = "User not found." });
        }

        user.DisplayName = dto.DisplayName.Trim();
        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return StatusCode(500, new { error = updateResult.Errors.FirstOrDefault()?.Description ?? "Update failed." });
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        await userManager.RemoveFromRolesAsync(user, currentRoles);
        await userManager.AddToRoleAsync(user, dto.Role);

        if (dto.Role == "Donor")
        {
            await EnsureDonorProfileAsync(user.Email!, user.DisplayName);
        }

        return NoContent();
    }

    // PUT /api/admin/users/{id}/role — replaces all roles for the user with the given role.
    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleDto dto)
    {
        var allowed = new[] { "Admin", "Donor" };
        if (!allowed.Contains(dto.Role))
        {
            return BadRequest(new { error = $"Role must be one of: {string.Join(", ", allowed)}." });
        }

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound(new { error = "User not found." });
        }

        // Remove all current roles then assign the new one
        var currentRoles = await userManager.GetRolesAsync(user);
        await userManager.RemoveFromRolesAsync(user, currentRoles);
        await userManager.AddToRoleAsync(user, dto.Role);

        if (dto.Role == "Donor")
        {
            await EnsureDonorProfileAsync(user.Email!, user.DisplayName);
        }

        return NoContent();
    }

    // DELETE /api/admin/users/{id} — deletes a user. Requires confirmation header. Cannot delete yourself or the last admin.
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleteGuardResult = RequireConfirmedDelete();
        if (deleteGuardResult is not null)
        {
            return deleteGuardResult;
        }

        var currentUserId = int.Parse(userManager.GetUserId(User)!);
        if (id == currentUserId)
        {
            return BadRequest(new { error = "You cannot delete your own account." });
        }

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound(new { error = "User not found." });
        }

        if (await userManager.IsInRoleAsync(user, "Admin"))
        {
            var adminUsers = await userManager.GetUsersInRoleAsync("Admin");
            if (adminUsers.Count <= 1)
            {
                return BadRequest(new { error = "You cannot delete the last administrator account." });
            }
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return StatusCode(500, new { error = result.Errors.FirstOrDefault()?.Description ?? "Delete failed." });
        }

        logger.LogWarning("Admin user {ActorUserId} deleted user {TargetUserId}.", userManager.GetUserId(User), id);
        return NoContent();
    }

    // POST /api/admin/users/{id}/unlock — clears the lockout on a user account.
    [HttpPost("users/{id:int}/unlock")]
    public async Task<IActionResult> UnlockUser(int id)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound(new { error = "User not found." });
        }

        await userManager.SetLockoutEndDateAsync(user, null);
        await userManager.ResetAccessFailedCountAsync(user);

        return NoContent();
    }

    // ── Database Query ─────────────────────────────────────────────────────

    // POST /api/admin/query — runs a validated read-only SQL query and returns columns + rows (max 200).
    [HttpPost("query")]
    public async Task<IActionResult> RunQuery([FromBody] QueryRequestDto dto)
    {
        if (!AdminSqlGuard.TryValidateReadOnlyQuery(dto.Sql, out var sql, out var validationError))
        {
            return BadRequest(new { error = validationError });
        }

        var connection = db.Database.GetDbConnection();
        await db.Database.OpenConnectionAsync();

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.CommandTimeout = 15;

            await using var reader = await command.ExecuteReaderAsync();

            var columns = Enumerable.Range(0, reader.FieldCount)
                .Select(i => reader.GetName(i))
                .ToArray();

            var rows = new List<object?[]>();
            while (await reader.ReadAsync())
            {
                var row = new object?[reader.FieldCount];
                for (var i = 0; i < reader.FieldCount; i++)
                {
                    row[i] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                }
                rows.Add(row);

                if (rows.Count >= 200) break;
            }

            logger.LogInformation("Admin user {ActorUserId} executed approved read-only query against {TableCount} table(s).",
                userManager.GetUserId(User),
                sql.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Length);
            return Ok(new { columns, rows });
        }
        catch (DbException ex)
        {
            logger.LogWarning(ex, "Admin user {ActorUserId} submitted an invalid read-only query.", userManager.GetUserId(User));
            return BadRequest(new { error = "Query execution failed. Review the syntax and allowed tables." });
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    // GET /api/admin/roles — returns all role names defined in the system.
    [HttpGet("roles")]
    public async Task<ActionResult<IEnumerable<string>>> GetRoles()
    {
        var roles = await roleManager.Roles.Select(r => r.Name!).ToListAsync();
        return Ok(roles);
    }

    private async Task EnsureDonorProfileAsync(string email, string displayName)
    {
        await supporterProfiles.EnsureSupporterProfileAsync(email, displayName, acquisitionChannel: "AdminUserProvisioning");
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
