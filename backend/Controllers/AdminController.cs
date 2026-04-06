using System.Data.Common;
using backend.Data;
using backend.Models;
using backend.Models.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    AppDbContext db) : ControllerBase
{
    // ── User Management ────────────────────────────────────────────────────

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

        return NoContent();
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
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

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return StatusCode(500, new { error = result.Errors.FirstOrDefault()?.Description ?? "Delete failed." });
        }

        return NoContent();
    }

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

    [HttpPost("query")]
    public async Task<IActionResult> RunQuery([FromBody] QueryRequestDto dto)
    {
        var sql = dto.Sql.Trim();

        // Only allow SELECT statements
        if (!sql.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "Only SELECT statements are allowed." });
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

                if (rows.Count >= 500) break; // cap at 500 rows
            }

            return Ok(new { columns, rows });
        }
        catch (DbException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    [HttpGet("roles")]
    public async Task<ActionResult<IEnumerable<string>>> GetRoles()
    {
        var roles = await roleManager.Roles.Select(r => r.Name!).ToListAsync();
        return Ok(roles);
    }
}
