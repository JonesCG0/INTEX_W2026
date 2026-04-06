using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Add DbSet<T> properties here as models are created during the project week.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> AppUsers => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("app_users");
            entity.HasKey(user => user.Id);
            entity.Property(user => user.Email).IsRequired().HasMaxLength(256);
            entity.Property(user => user.DisplayName).IsRequired().HasMaxLength(256);
            entity.Property(user => user.PasswordHash).IsRequired().HasMaxLength(512);
            entity.Property(user => user.Role).IsRequired().HasMaxLength(32);
            entity.Property(user => user.CreatedAt).HasColumnType("datetime2(0)");
            entity.HasIndex(user => user.Email).IsUnique();
        });
    }
}
