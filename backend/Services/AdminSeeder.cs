using backend.Data;
using backend.Models;
using backend.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class AdminSeeder(AppDbContext db, IOptions<AdminSeedOptions> options)
{
    public async Task EnsureAdminAsync(CancellationToken cancellationToken = default)
    {
        var seedOptions = options.Value;
        if (string.IsNullOrWhiteSpace(seedOptions.Email) || string.IsNullOrWhiteSpace(seedOptions.Password))
        {
            return;
        }

        var normalizedEmail = seedOptions.Email.Trim();
        var existingAdmin = await db.AppUsers.FirstOrDefaultAsync(user => user.Email == normalizedEmail, cancellationToken);
        if (existingAdmin is not null)
        {
            if (existingAdmin.Role != "Admin")
            {
                existingAdmin.Role = "Admin";
                existingAdmin.DisplayName = string.IsNullOrWhiteSpace(seedOptions.DisplayName)
                    ? existingAdmin.DisplayName
                    : seedOptions.DisplayName;
                await db.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        var user = new AppUser
        {
            Email = normalizedEmail,
            DisplayName = string.IsNullOrWhiteSpace(seedOptions.DisplayName)
                ? "Project Haven Admin"
                : seedOptions.DisplayName.Trim(),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = new PasswordHasher<AppUser>().HashPassword(user, seedOptions.Password);

        db.AppUsers.Add(user);
        await db.SaveChangesAsync(cancellationToken);
    }
}
