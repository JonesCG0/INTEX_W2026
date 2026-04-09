using backend.Data;
using backend.Models.Canonical;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class SupporterProfileService(AppDbContext db)
{
    public async Task<Supporter> EnsureSupporterProfileAsync(
        string email,
        string displayName,
        string supporterType = "Individual",
        string acquisitionChannel = "Website",
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();
        var supporter = await db.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.Email == normalizedEmail, cancellationToken);

        if (supporter is not null)
        {
            supporter.DisplayName = displayName.Trim();
            supporter.SupporterType = string.IsNullOrWhiteSpace(supporter.SupporterType) ? supporterType : supporter.SupporterType;
            supporter.Status = string.IsNullOrWhiteSpace(supporter.Status) ? "Active" : supporter.Status;
            supporter.AcquisitionChannel ??= acquisitionChannel;
            supporter.Country ??= "Philippines";
            await db.SaveChangesAsync(cancellationToken);
            return supporter;
        }

        (string? firstName, string? lastName) = SplitDisplayName(displayName);

        supporter = new Supporter
        {
            SupporterType = supporterType,
            DisplayName = displayName.Trim(),
            FirstName = firstName,
            LastName = lastName,
            RelationshipType = "Direct",
            Region = "Unspecified",
            Country = "Philippines",
            Email = normalizedEmail,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            AcquisitionChannel = acquisitionChannel
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync(cancellationToken);
        return supporter;
    }

    private static (string? FirstName, string? LastName) SplitDisplayName(string displayName)
    {
        var parts = displayName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0)
        {
            return (null, null);
        }

        if (parts.Length == 1)
        {
            return (parts[0], null);
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }
}
