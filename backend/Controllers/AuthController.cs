using System.Security.Claims;
using backend.Models;
using backend.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager) : ControllerBase
{
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
        var primaryRole = roles.FirstOrDefault() ?? "User";

        // Sign in via Identity — handles scheme, security stamp, and cookie correctly
        var additionalClaims = new List<Claim>
        {
            new("DisplayName", user.DisplayName)
        };
        await signInManager.SignInWithClaimsAsync(user, isPersistent: true, additionalClaims);

        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, primaryRole));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
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

        // New accounts are Donors by default
        await userManager.AddToRoleAsync(user, "Donor");

        var additionalClaims = new List<Claim>
        {
            new("DisplayName", user.DisplayName)
        };
        await signInManager.SignInWithClaimsAsync(user, isPersistent: true, additionalClaims);

        return Ok(new AuthResponseDto(true, user.Email ?? string.Empty, user.DisplayName, "Donor"));
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
        var primaryRole = roles.FirstOrDefault();

        return Ok(new CurrentUserDto(true, user.Email, user.DisplayName, primaryRole));
    }
}
