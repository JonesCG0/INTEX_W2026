using backend.Models;
using backend.Models.AdminPortal;
using backend.Models.Canonical;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Main EF Core database context. Extends IdentityDbContext so ASP.NET Identity tables are included.
// Also handles manual ID assignment for tables that don't use IDENTITY columns.
public class AppDbContext(
    DbContextOptions<AppDbContext> options,
    DatabaseKeyMode databaseKeyMode)
    : IdentityDbContext<AppUser, IdentityRole<int>, int>(options)
{
    private readonly DatabaseKeyMode _databaseKeyMode = databaseKeyMode;
    public DbSet<PortalDonor> PortalDonors => Set<PortalDonor>();
    public DbSet<PortalContribution> PortalContributions => Set<PortalContribution>();
    public DbSet<PortalResident> PortalResidents => Set<PortalResident>();
    public DbSet<PortalRecording> PortalRecordings => Set<PortalRecording>();
    public DbSet<PortalVisitation> PortalVisitations => Set<PortalVisitation>();
    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(256);
        });

        ConfigureManualAssignment(modelBuilder.Entity<Safehouse>(), "safehouses", s => s.SafehouseId);
        ConfigureManualAssignment(modelBuilder.Entity<Supporter>(), "supporters", s => s.SupporterId);
        ConfigureManualAssignment(modelBuilder.Entity<Donation>(), "donations", d => d.DonationId);
        ConfigureManualAssignment(modelBuilder.Entity<Resident>(), "residents", r => r.ResidentId);
        ConfigureManualAssignment(modelBuilder.Entity<ProcessRecording>(), "process_recordings", r => r.RecordingId);
        ConfigureManualAssignment(modelBuilder.Entity<HomeVisitation>(), "home_visitations", v => v.VisitationId);
        ConfigureManualAssignment(modelBuilder.Entity<InterventionPlan>(), "intervention_plans", p => p.PlanId);
        ConfigureManualAssignment(modelBuilder.Entity<SocialMediaPost>(), "social_media_posts", p => p.PostId);
        ConfigureManualAssignment(modelBuilder.Entity<DonationAllocation>(), "donation_allocations", a => a.AllocationId);

        modelBuilder.Entity<Safehouse>(entity =>
        {
            entity.HasQueryFilter(s => s.SafehouseId > 0);
        });

        modelBuilder.Entity<PortalDonor>(entity =>
        {
            entity.ToTable("portal_donors");
            entity.Property(d => d.DisplayName).HasMaxLength(256).IsRequired();
            entity.Property(d => d.LinkedEmail).HasMaxLength(256).IsRequired(false);
            entity.HasIndex(d => d.LinkedEmail).IsUnique();
            entity.Property(d => d.DonorType).HasMaxLength(100).IsRequired();
            entity.Property(d => d.Status).HasMaxLength(50).IsRequired();
            entity.Property(d => d.PreferredChannel).HasMaxLength(100).IsRequired();
            entity.Property(d => d.StewardshipLead).HasMaxLength(100).IsRequired();
            entity.Property(d => d.TotalGivenPhp).HasPrecision(18, 2);
            entity.HasMany(d => d.Contributions)
                .WithOne(c => c.Donor)
                .HasForeignKey(c => c.DonorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortalContribution>(entity =>
        {
            entity.ToTable("portal_contributions");
            entity.Property(c => c.ContributionType).HasMaxLength(100).IsRequired();
            entity.Property(c => c.ProgramArea).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Description).HasMaxLength(1000).IsRequired();
            entity.Property(c => c.AmountPhp).HasPrecision(18, 2);
            entity.Property(c => c.EstimatedValuePhp).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PortalResident>(entity =>
        {
            entity.ToTable("portal_residents");
            entity.Property(r => r.CodeName).HasMaxLength(100).IsRequired();
            entity.Property(r => r.Safehouse).HasMaxLength(120).IsRequired();
            entity.Property(r => r.CaseCategory).HasMaxLength(120).IsRequired();
            entity.Property(r => r.RiskLevel).HasMaxLength(50).IsRequired();
            entity.Property(r => r.Status).HasMaxLength(50).IsRequired();
            entity.Property(r => r.AssignedStaff).HasMaxLength(120).IsRequired();
            entity.HasMany(r => r.Recordings)
                .WithOne(c => c.Resident)
                .HasForeignKey(c => c.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(r => r.Visitations)
                .WithOne(v => v.Resident)
                .HasForeignKey(v => v.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortalRecording>(entity =>
        {
            entity.ToTable("portal_recordings");
            entity.Property(r => r.StaffName).HasMaxLength(120).IsRequired();
            entity.Property(r => r.SessionType).HasMaxLength(80).IsRequired();
            entity.Property(r => r.EmotionalState).HasMaxLength(120).IsRequired();
            entity.Property(r => r.Summary).HasMaxLength(1500).IsRequired();
            entity.Property(r => r.Interventions).HasMaxLength(1500).IsRequired();
            entity.Property(r => r.FollowUp).HasMaxLength(1500).IsRequired();
        });

        modelBuilder.Entity<PortalVisitation>(entity =>
        {
            entity.ToTable("portal_visitations");
            entity.Property(v => v.VisitType).HasMaxLength(120).IsRequired();
            entity.Property(v => v.Observations).HasMaxLength(1500).IsRequired();
            entity.Property(v => v.FamilyCooperation).HasMaxLength(80).IsRequired();
            entity.Property(v => v.SafetyConcerns).HasMaxLength(1500).IsRequired();
            entity.Property(v => v.FollowUp).HasMaxLength(1500).IsRequired();
        });

        modelBuilder.Entity<Supporter>(entity =>
        {
            entity.HasQueryFilter(s => s.SupporterId > 0);
            entity.HasIndex(s => s.Email);
            entity.HasMany(s => s.Donations)
                .WithOne(d => d.Supporter)
                .HasForeignKey(d => d.SupporterId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Donation>(entity =>
        {
            entity.HasQueryFilter(d => d.DonationId > 0 && d.SupporterId > 0);
            entity.Property(d => d.Amount).HasPrecision(18, 2);
            entity.Property(d => d.EstimatedValue).HasPrecision(18, 2);
            entity.HasMany(d => d.Allocations)
                .WithOne(a => a.Donation)
                .HasForeignKey(a => a.DonationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DonationAllocation>(entity =>
        {
            entity.HasQueryFilter(a => a.AllocationId > 0 && a.DonationId > 0);
            entity.Property(a => a.AmountAllocated).HasPrecision(18, 2);
            entity.HasOne(a => a.Safehouse)
                .WithMany()
                .HasForeignKey(a => a.SafehouseId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Resident>(entity =>
        {
            entity.HasQueryFilter(r => r.ResidentId > 0 && r.SafehouseId > 0);
            entity.HasIndex(r => r.InternalCode);
            entity.HasOne(r => r.Safehouse)
                .WithMany()
                .HasForeignKey(r => r.SafehouseId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasMany(r => r.ProcessRecordings)
                .WithOne(pr => pr.Resident)
                .HasForeignKey(pr => pr.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(r => r.HomeVisitations)
                .WithOne(v => v.Resident)
                .HasForeignKey(v => v.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(r => r.InterventionPlans)
                .WithOne(p => p.Resident)
                .HasForeignKey(p => p.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SocialMediaPost>(entity =>
        {
            entity.Property(p => p.EngagementRate).HasPrecision(18, 4);
            entity.Property(p => p.EstimatedDonationValuePhp).HasPrecision(18, 2);
        });

        modelBuilder.Entity<InterventionPlan>(entity =>
        {
            entity.Property(p => p.TargetValue).HasPrecision(18, 2);
        });
    }

    public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        await AssignManualIdsAsync(Supporters, "supporters", s => s.SupporterId, (s, id) => s.SupporterId = id, cancellationToken);
        await AssignManualIdsAsync(Donations, "donations", d => d.DonationId, (d, id) => d.DonationId = id, cancellationToken);
        await AssignManualIdsAsync(Safehouses, "safehouses", s => s.SafehouseId, (s, id) => s.SafehouseId = id, cancellationToken);
        await AssignManualIdsAsync(Residents, "residents", r => r.ResidentId, (r, id) => r.ResidentId = id, cancellationToken);
        await AssignManualIdsAsync(ProcessRecordings, "process_recordings", r => r.RecordingId, (r, id) => r.RecordingId = id, cancellationToken);
        await AssignManualIdsAsync(HomeVisitations, "home_visitations", v => v.VisitationId, (v, id) => v.VisitationId = id, cancellationToken);
        await AssignManualIdsAsync(InterventionPlans, "intervention_plans", p => p.PlanId, (p, id) => p.PlanId = id, cancellationToken);
        await AssignManualIdsAsync(SocialMediaPosts, "social_media_posts", p => p.PostId, (p, id) => p.PostId = id, cancellationToken);
        await AssignManualIdsAsync(DonationAllocations, "donation_allocations", a => a.AllocationId, (a, id) => a.AllocationId = id, cancellationToken);

        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    // Marks the PK as ValueGeneratedNever for tables that require manual ID assignment.
    private void ConfigureManualAssignment<T>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<T> builder, string tableName, System.Linq.Expressions.Expression<Func<T, int>> keyExpression) where T : class
    {
        if (_databaseKeyMode.IsManual(tableName))
        {
            builder.Property(keyExpression).ValueGeneratedNever();
        }
    }

    // Before saving, assigns sequential IDs to any new entities whose IDs are still unset (<=0).
    private async Task AssignManualIdsAsync<T>(DbSet<T> dbSet, string tableName, System.Linq.Expressions.Expression<Func<T, int>> keyExpression, Action<T, int> keySetter, CancellationToken cancellationToken) where T : class
    {
        if (!_databaseKeyMode.IsManual(tableName))
        {
            return;
        }

        var keySelector = keyExpression.Compile();

        var added = ChangeTracker.Entries<T>()
            .Where(e => e.State == EntityState.Added && keySelector(e.Entity) <= 0)
            .Select(e => e.Entity)
            .ToList();

        if (added.Count == 0)
        {
            return;
        }

        int next;
        if (!await dbSet.IgnoreQueryFilters().AnyAsync(cancellationToken))
        {
            next = 1;
        }
        else
        {
            next = await dbSet.IgnoreQueryFilters().MaxAsync(keyExpression, cancellationToken) + 1;
        }

        foreach (var entity in added)
        {
            keySetter(entity, next++);
        }
    }
}
