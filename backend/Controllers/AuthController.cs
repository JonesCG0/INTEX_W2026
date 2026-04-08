using System.Security.Claims;
using backend.Data;
using backend.Models.AdminPortal;
using backend.Models;
using backend.Models.Auth;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager,
    AuthTokenService authTokenService,
    AppDbContext db) : ControllerBase
{
    // Returns the highest-privilege role when a user has multiple roles.
    private static string ResolvePrimaryRole(IList<string> roles)
    {
        if (roles.Contains("Admin")) return "Admin";
        if (roles.Contains("Donor")) return "Donor";
        return roles.FirstOrDefault() ?? "User";
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
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

        var sessionToken = authTokenService.CreateToken(user, roles.ToArray());
        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, primaryRole, sessionToken));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new CurrentUserDto(false, null, null, null));
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

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { error = "Passwords do not match." });
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

        var donorProfile = await db.PortalDonors.FirstOrDefaultAsync(d => d.LinkedEmail == user.Email);
        if (donorProfile is null)
        {
            db.PortalDonors.Add(new PortalDonor
            {
                DisplayName = user.DisplayName,
                LinkedEmail = user.Email,
                DonorType = "Individual",
                Status = "Active",
                TotalGivenPhp = 0m,
                LastDonationAt = null,
                PreferredChannel = "Website",
                StewardshipLead = "Unassigned"
            });
            await db.SaveChangesAsync();
        }

        var additionalClaims = new List<Claim>
        {
            new("DisplayName", user.DisplayName)
        };
        await signInManager.SignInWithClaimsAsync(user, isPersistent: true, additionalClaims);

        var sessionToken = authTokenService.CreateToken(user, ["Donor"]);
        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, "Donor", sessionToken));
    }
}
