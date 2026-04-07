using backend.Models;
using backend.Models.AdminPortal;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Add DbSet<T> properties here as models are created during the project week.
public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<int>, int>(options)
{
    public DbSet<PortalDonor> PortalDonors => Set<PortalDonor>();
    public DbSet<PortalContribution> PortalContributions => Set<PortalContribution>();
    public DbSet<PortalResident> PortalResidents => Set<PortalResident>();
    public DbSet<PortalRecording> PortalRecordings => Set<PortalRecording>();
    public DbSet<PortalVisitation> PortalVisitations => Set<PortalVisitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(256);
        });

        modelBuilder.Entity<PortalDonor>(entity =>
        {
            entity.ToTable("portal_donors");
            entity.Property(d => d.DisplayName).HasMaxLength(256).IsRequired();
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
    }
}
