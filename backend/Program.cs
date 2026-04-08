using backend.Data;
using backend.Models;
using backend.Models.Auth;
using backend.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentity<AppUser, IdentityRole<int>>(options =>
{
    // IS414: stricter than Microsoft defaults (default min is 6)
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12;
    options.User.RequireUniqueEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = ".ProjectHaven.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = builder.Environment.IsDevelopment()
        ? SameSiteMode.Lax
        : SameSiteMode.None;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    // Return 401 instead of redirecting to a login page (API behaviour)
    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddScoped<CsvDatabaseSeeder>();
builder.Services.AddScoped<AdminSeeder>();
builder.Services.AddScoped<AdminPortalStore>();
builder.Services.AddScoped<AuthTokenService>();
builder.Services.AddSingleton<StartupDiagnostics>();
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection("AdminSeed"));
builder.Services.AddDataProtection();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Read allowed origins from config and keep a safe fallback for the deployed Static Web Apps origin.
var configuredOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
var fallbackOrigins = new[]
{
    "https://polite-rock-003bb5b1e.1.azurestaticapps.net",
    "http://localhost:5173",
    "https://localhost:5173",
};
var allowedOrigins = configuredOrigins
    .Concat(fallbackOrigins)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

if (args.Any(a => a.Equals("--seed-csv", StringComparison.OrdinalIgnoreCase)))
{
    using var seedApp = builder.Build();
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Cannot seed CSV data because ConnectionStrings:DefaultConnection is not configured.");
    }

    using var scope = seedApp.Services.CreateScope();

    // Run migrations before seeding
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    try 
    {
        var seeder = scope.ServiceProvider.GetRequiredService<CsvDatabaseSeeder>();
        var index = Array.FindIndex(args, a => a.Equals("--seed-csv", StringComparison.OrdinalIgnoreCase));
        var csvPath = (args.Length > index + 1) ? args[index + 1] : "seed_data";
        await seeder.SeedAsync(csvPath);
        Console.WriteLine("[INFO] Seeding completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[FATAL] Seeding failed: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
        Environment.Exit(1);
    }
    return;
}

var app = builder.Build();

if (!string.IsNullOrWhiteSpace(connectionString))
{
    var startupDiagnostics = app.Services.GetRequiredService<StartupDiagnostics>();

    try
    {
        using var scope = app.Services.CreateScope();

        // Auto-apply migrations on startup
        startupDiagnostics.RecordCheckpoint("ef-migrations", "running");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        startupDiagnostics.RecordCheckpoint("ef-migrations", "ok");

        startupDiagnostics.RecordCheckpoint("schema-repair", "running");
        await EnsurePortalDonorLinkedEmailSchemaAsync(db);
        startupDiagnostics.RecordCheckpoint("schema-repair", "ok");

        startupDiagnostics.RecordCheckpoint("portal-seed", "running");
        var portalStore = scope.ServiceProvider.GetRequiredService<AdminPortalStore>();
        await portalStore.SeedAsync();
        startupDiagnostics.RecordCheckpoint("portal-seed", "ok");

        startupDiagnostics.RecordCheckpoint("admin-seed", "running");
        var adminSeeder = scope.ServiceProvider.GetRequiredService<AdminSeeder>();
        await adminSeeder.EnsureAdminAsync();
        startupDiagnostics.RecordCheckpoint("admin-seed", "ok");
    }
    catch (Exception ex)
    {
        startupDiagnostics.Record("database bootstrap", ex);
        app.Logger.LogError(ex, "Startup bootstrap failed.");
    }
}
else
{
    app.Logger.LogWarning("DefaultConnection is not configured. Skipping database bootstrap and admin seeding.");
}

app.Logger.LogInformation("CORS allowed origins: {Origins}", string.Join(", ", allowedOrigins));

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.Use(async (context, next) =>
{
    if (context.User?.Identity?.IsAuthenticated != true)
    {
        var token = context.Request.Headers["X-ProjectHaven-Token"].FirstOrDefault()
            ?? context.Request.Headers.Authorization.FirstOrDefault()?.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ElementAtOrDefault(1);

        if (!string.IsNullOrWhiteSpace(token))
        {
            var tokenService = context.RequestServices.GetRequiredService<AuthTokenService>();
            var principal = tokenService.ValidateToken(token);
            if (principal is not null)
            {
                context.User = principal;
            }
        }
    }

    await next();
});
app.UseAuthorization();
app.MapControllers();
app.Run();

static async Task EnsurePortalDonorLinkedEmailSchemaAsync(AppDbContext db)
{
    const string addColumnSql = """
        IF COL_LENGTH('portal_donors', 'LinkedEmail') IS NULL
        BEGIN
            ALTER TABLE portal_donors ADD LinkedEmail nvarchar(256) NULL;
        END
        """;

    const string addIndexSql = """
        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'IX_portal_donors_LinkedEmail'
              AND object_id = OBJECT_ID('portal_donors')
        )
        BEGIN
            CREATE UNIQUE INDEX IX_portal_donors_LinkedEmail
            ON portal_donors(LinkedEmail)
            WHERE LinkedEmail IS NOT NULL;
        END
        """;

    await db.Database.ExecuteSqlRawAsync(addColumnSql);
    await db.Database.ExecuteSqlRawAsync(addIndexSql);
}
