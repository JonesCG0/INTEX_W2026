using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Add DbSet<T> properties here as models are created during the project week.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
