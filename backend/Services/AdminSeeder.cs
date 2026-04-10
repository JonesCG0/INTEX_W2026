using backend.Data;
using backend.Models;
using backend.Models.Auth;
using backend.Models.Canonical;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Services;

// Runs at startup to ensure the system has required roles, admin user, donor user,
// sample donations, public impact snapshots, and safehouse monthly metrics.
public sealed class AdminSeeder(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    IOptions<AdminSeedOptions> options,
    AppDbContext db,
    SupporterProfileService supporterProfiles)
{
    private const string AdminRole = "Admin";
    private const string DonorRole = "Donor";

    public async Task EnsureAdminAsync(CancellationToken cancellationToken = default)
    {
        var seedOptions = options.Value;
        if (string.IsNullOrWhiteSpace(seedOptions.Email) || string.IsNullOrWhiteSpace(seedOptions.Password))
        {
            return;
        }

        Console.WriteLine("**************** [BOOTSTRAP] STARTING ADMIN/DONOR SEEDING ****************");

        try
        {
            // 1. Roles
            if (!await roleManager.RoleExistsAsync(AdminRole))
                await roleManager.CreateAsync(new IdentityRole<int>(AdminRole));
            
            if (!await roleManager.RoleExistsAsync(DonorRole))
                await roleManager.CreateAsync(new IdentityRole<int>(DonorRole));

            // 2. Admin User
            var adminEmail = seedOptions.Email.Trim();
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new AppUser { UserName = adminEmail, Email = adminEmail, DisplayName = seedOptions.DisplayName ?? "Admin", EmailConfirmed = true };
                adminUser.PasswordHash = userManager.PasswordHasher.HashPassword(adminUser, seedOptions.Password);
                await userManager.CreateAsync(adminUser);
            }
            if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
                await userManager.AddToRoleAsync(adminUser, AdminRole);

            // 3. Donor User & Profile
            var donorEmail = seedOptions.DonorEmail?.Trim();
            if (!string.IsNullOrWhiteSpace(donorEmail))
            {
                var donorUser = await userManager.FindByEmailAsync(donorEmail);
                if (donorUser == null)
                {
                    donorUser = new AppUser { UserName = donorEmail, Email = donorEmail, DisplayName = seedOptions.DonorDisplayName ?? "Donor", EmailConfirmed = true };
                    donorUser.PasswordHash = userManager.PasswordHasher.HashPassword(donorUser, seedOptions.DonorPassword ?? "ProjectHaven2026!");
                    await userManager.CreateAsync(donorUser);
                    await userManager.AddToRoleAsync(donorUser, DonorRole);
                }

                var supporter = await supporterProfiles.EnsureSupporterProfileAsync(
                    donorEmail,
                    donorUser.DisplayName,
                    acquisitionChannel: "SeededAccount",
                    cancellationToken: cancellationToken);

                Console.WriteLine($"[BOOTSTRAP] Active Donor Supporter ID: {supporter.SupporterId}");

                // 4. Historical Donations
                // NOTE: Using IgnoreQueryFilters to see all records
                var donationCount = await db.Donations
                    .IgnoreQueryFilters()
                    .CountAsync(d => d.SupporterId == supporter.SupporterId, cancellationToken);
                
                Console.WriteLine($"[BOOTSTRAP] Current donation count for donor: {donationCount}");

                if (donationCount < 6)
                {
                    Console.WriteLine("[BOOTSTRAP] Seeding monthly trend records for donor...");
                    var history = new List<Donation>();
                    var baseDate = DateTime.Now.Date.AddMonths(-6);
                    for (int i = 0; i < 6; i++)
                    {
                        var dDate = baseDate.AddMonths(i).AddDays(10);
                        history.Add(new Donation
                        {
                            // Assign unique negative IDs to avoid EF tracking collision when ManualAssignment is enabled
                            DonationId = -(i + 1),
                            SupporterId = supporter.SupporterId,
                            Amount = 25000 + (i * 5000),
                            DonationDate = dDate,
                            DonationType = "Cash",
                            CurrencyCode = "PHP",
                            CampaignName = "Historical Trend",
                            Notes = "Generated for dashboard trend analysis"
                        });
                    }
                    db.Donations.AddRange(history);
                    await db.SaveChangesAsync(cancellationToken);
                    Console.WriteLine("[BOOTSTRAP] Historical donations saved.");
                }
            }

            // 5. Public Impact Snapshots
            var snapshotCount = await db.PublicImpactSnapshots.IgnoreQueryFilters().CountAsync(cancellationToken);
            if (snapshotCount < 2)
            {
                Console.WriteLine("[BOOTSTRAP] Seeding Public Impact Snapshots...");
                db.PublicImpactSnapshots.AddRange(new[]
                {
                    new PublicImpactSnapshot { SnapshotId = -1, SnapshotDate = DateTime.Now.AddMonths(-1), Headline = "2025 Annual Recovery Review", SummaryText = "Project Haven successfully transitioned 45 survivors into independent living this year.", IsPublished = true, PublishedAt = DateTime.Now.AddMonths(-1) },
                    new PublicImpactSnapshot { SnapshotId = -2, SnapshotDate = DateTime.Now, Headline = "Project Haven: 2026 Impact Overview", SummaryText = "Our safehouse network has seen significant growth in resident care and educational success.", IsPublished = true, PublishedAt = DateTime.Now }
                });
                await db.SaveChangesAsync(cancellationToken);
                Console.WriteLine("[BOOTSTRAP] Impact snapshots saved.");
            }

            // 6. Safehouse Monthly Metrics
            var metricsCount = await db.SafehouseMonthlyMetrics.IgnoreQueryFilters().CountAsync(cancellationToken);
            if (metricsCount < 6)
            {
                Console.WriteLine("[BOOTSTRAP] Seeding Safehouse Monthly Metrics...");
                var safehouses = await db.Safehouses.IgnoreQueryFilters().ToListAsync(cancellationToken);
                if (safehouses.Any())
                {
                    var metrics = new List<SafehouseMonthlyMetric>();
                    var baseDate = DateTime.Now.Date.AddMonths(-6);
                    int metricId = -1;
                    foreach (var sh in safehouses)
                    {
                        for (int i = 0; i < 6; i++)
                        {
                            metrics.Add(new SafehouseMonthlyMetric
                            {
                                MetricId = metricId--,
                                SafehouseId = sh.SafehouseId,
                                MonthStart = new DateTime(baseDate.AddMonths(i).Year, baseDate.AddMonths(i).Month, 1),
                                ActiveResidents = 12 + i,
                                AvgEducationProgress = 0.60m + (i * 0.05m),
                                AvgHealthScore = 0.70m + (i * 0.04m)
                            });
                        }
                    }
                    db.SafehouseMonthlyMetrics.AddRange(metrics);
                    await db.SaveChangesAsync(cancellationToken);
                    Console.WriteLine("[BOOTSTRAP] Safehouse metrics saved.");
                }
            }

            Console.WriteLine("**************** [BOOTSTRAP] SEEDING COMPLETED SUCCESSFULLY ****************");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("**************** [BOOTSTRAP] CRITICAL SEEDING ERROR ****************");
            Console.Error.WriteLine(ex.ToString());
            throw;
        }
    }
}
