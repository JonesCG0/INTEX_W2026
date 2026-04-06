using backend.Models;
using backend.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class AdminSeeder(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    IOptions<AdminSeedOptions> options)
{
    private const string AdminRole = "Admin";

    public async Task EnsureAdminAsync(CancellationToken cancellationToken = default)
    {
        var seedOptions = options.Value;
        if (string.IsNullOrWhiteSpace(seedOptions.Email) || string.IsNullOrWhiteSpace(seedOptions.Password))
        {
            return;
        }

        // Ensure the Admin role exists
        if (!await roleManager.RoleExistsAsync(AdminRole))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(AdminRole));
        }

        // Ensure the Donor role exists
        if (!await roleManager.RoleExistsAsync("Donor"))
        {
            await roleManager.CreateAsync(new IdentityRole<int>("Donor"));
        }

        var normalizedEmail = seedOptions.Email.Trim();
        var existingUser = await userManager.FindByEmailAsync(normalizedEmail);

        if (existingUser is not null)
        {
            // Promote to admin if not already
            if (!await userManager.IsInRoleAsync(existingUser, AdminRole))
            {
                await userManager.AddToRoleAsync(existingUser, AdminRole);
            }
            return;
        }

        var user = new AppUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            DisplayName = string.IsNullOrWhiteSpace(seedOptions.DisplayName)
                ? "Project Haven Admin"
                : seedOptions.DisplayName.Trim(),
            EmailConfirmed = true
        };

        // Bypass password policy for the seed account by hashing directly
        user.PasswordHash = userManager.PasswordHasher.HashPassword(user, seedOptions.Password);

        var result = await userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create admin seed user: {errors}");
        }

        await userManager.AddToRoleAsync(user, AdminRole);
    }
}
