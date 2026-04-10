using System.Security.Claims;
using backend.Data;
using backend.Models;
using backend.Models.Auth;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

// Handles login, logout, registration, and current-user checks.
[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db,
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager,
    SupporterProfileService supporterProfiles) : ControllerBase
{
    // Returns the highest-privilege role when a user has multiple roles.
    private static string ResolvePrimaryRole(IList<string> roles)
    {
        if (roles.Contains("Admin")) return "Admin";
        if (roles.Contains("Donor")) return "Donor";
        return roles.FirstOrDefault() ?? "User";
    }

    // POST /api/auth/login — validates credentials and sets the auth cookie.
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var normalizedEmail = request.Email.Trim();

        if (!HasConnectionString())
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Authentication is temporarily unavailable." });
        }

        var user = await userManager.FindByEmailAsync(normalizedEmail);
        if (user is null)
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = ResolvePrimaryRole(roles);

        var additionalClaims = new List<Claim>
        {
            new("DisplayName", user.DisplayName)
        };
        await signInManager.SignInWithClaimsAsync(user, isPersistent: true, additionalClaims);

        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, primaryRole));
    }

    private bool HasConnectionString() =>
        !string.IsNullOrWhiteSpace(db.Database.GetDbConnection().ConnectionString);

    // POST /api/auth/logout — clears the auth cookie.
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }

    // GET /api/auth/me — returns the current user's info, or an unauthenticated response if not logged in.
    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new CurrentUserDto(false, null, null, null));
        }

        if (!HasConnectionString())
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Authentication is temporarily unavailable." });
        }

        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Ok(new CurrentUserDto(false, null, null, null));
        }

        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = ResolvePrimaryRole(roles);

        return Ok(new CurrentUserDto(true, user.Email, user.DisplayName, primaryRole));
    }

    // POST /api/auth/register — creates a new Donor account and logs them in immediately.
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { error = "Passwords do not match." });
        }

        if (!HasConnectionString())
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Authentication is temporarily unavailable." });
        }

        var existing = await userManager.FindByEmailAsync(request.Email.Trim());
        if (existing is not null)
        {
            return Conflict(new { error = "An account with that email already exists." });
        }

        var user = new AppUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim(),
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Registration failed.";
            return BadRequest(new { error = firstError });
        }

        await userManager.AddToRoleAsync(user, "Donor");
        await supporterProfiles.EnsureSupporterProfileAsync(user.Email!, user.DisplayName, acquisitionChannel: "SelfRegistration");

        var additionalClaims = new List<Claim>
        {
            new("DisplayName", user.DisplayName)
        };
        await signInManager.SignInWithClaimsAsync(user, isPersistent: true, additionalClaims);

        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, "Donor"));
    }
}
