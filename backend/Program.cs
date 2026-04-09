using backend.Data;
using backend.Models;
using backend.Models.Auth;
using backend.Services;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

DatabaseKeyMode databaseKeyMode;
try
{
    databaseKeyMode = await DatabaseSchemaProbe.DetectAsync(connectionString);
}
catch (Exception probeEx)
{
    Console.Error.WriteLine($"[WARN] DatabaseSchemaProbe failed, using defaults: {probeEx.Message}");
    databaseKeyMode = new DatabaseKeyMode();
}
builder.Services.AddSingleton(databaseKeyMode);
// #region agent log
try
{
    var probeLogPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "debug-3a6e33.log"));
    await File.AppendAllTextAsync(
        probeLogPath,
        JsonSerializer.Serialize(new
        {
            sessionId = "3a6e33",
            runId = "probe",
            hypothesisId = "H5",
            location = "Program.cs:supporter-probe",
            message = "supporter_id COLUMNPROPERTY IsIdentity probe",
        data = new 
        { 
            manualAssignmentTables = databaseKeyMode.ManualAssignmentTables.ToArray()
        },
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        }) + Environment.NewLine);
}
catch
{
    // ignore debug log I/O failures
}

// #endregion

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

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

var authCookieDomain = builder.Configuration["AuthCookie:Domain"];
var authCookieSameSite = builder.Configuration["AuthCookie:SameSite"];

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = ".ProjectHaven.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Path = "/";
    if (!string.IsNullOrWhiteSpace(authCookieDomain))
    {
        options.Cookie.Domain = authCookieDomain;
    }

    options.Cookie.SameSite = TryParseSameSiteMode(authCookieSameSite)
        ?? (builder.Environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None);
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
builder.Services.AddScoped<CanonicalAdminPortalStore>();
builder.Services.AddScoped<MlPredictionSeeder>();
builder.Services.AddScoped<SupporterProfileService>();
builder.Services.AddSingleton<StartupDiagnostics>();
builder.Services.AddSingleton<AzureMlJobClient>();
builder.Services.AddSingleton<MlPipelineStore>();
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection("AdminSeed"));
builder.Services.Configure<AzureMlOptions>(builder.Configuration.GetSection("AzureMl"));
builder.Services.AddDataProtection();

builder.Services.AddControllers();
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddOpenApi();

// Read allowed origins from config and keep a safe fallback for the deployed Static Web Apps origin.
var configuredOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
var fallbackOrigins = new[]
{
    "https://polite-rock-003bb5b1e.1.azurestaticapps.net",
    "https://jonescg0.net",
    "https://www.jonescg0.net",
    "http://localhost:5173",
    "https://localhost:5173",
};
var allowedOrigins = configuredOrigins
    .Concat(fallbackOrigins)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

var contentSecurityPolicy = builder.Environment.IsDevelopment()
    ? "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: http://localhost:*;"
    : "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;";

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
        // #region agent log
        var connectionDetails = new SqlConnectionStringBuilder(connectionString);
        await WriteDebugLogAsync(builder.Environment, "pre", "H4", "Program.cs:151", "connection target", new
        {
            dataSource = connectionDetails.DataSource,
            initialCatalog = connectionDetails.InitialCatalog,
            encrypt = connectionDetails.Encrypt,
            trustServerCertificate = connectionDetails.TrustServerCertificate
        });
        await WriteDebugLogAsync(builder.Environment, "pre", "H1", "Program.cs:158", "before migrate", new
        {
            canConnectString = !string.IsNullOrWhiteSpace(connectionString),
            appliedMigrations = await db.Database.GetAppliedMigrationsAsync(),
            pendingMigrations = await db.Database.GetPendingMigrationsAsync()
        });
        await WriteDebugLogAsync(builder.Environment, "pre", "H2", "Program.cs:165", "model metadata", new
        {
            entityCount = db.Model.GetEntityTypes().Count(),
            hasInterventionPlan = db.Model.FindEntityType(typeof(backend.Models.Canonical.InterventionPlan)) != null,
            targetValuePrecision = db.Model.FindEntityType(typeof(backend.Models.Canonical.InterventionPlan))?.FindProperty(nameof(backend.Models.Canonical.InterventionPlan.TargetValue))?.GetPrecision(),
            hasDonationAllocationSafehouseFk = db.Model.FindEntityType(typeof(backend.Models.Canonical.DonationAllocation))?.GetForeignKeys().Any(fk => fk.Properties.Any(p => p.Name == "SafehouseId")) ?? false
        });
        // #endregion
        await db.Database.MigrateAsync();
        // #region agent log
        await WriteDebugLogAsync(builder.Environment, "pre", "H1", "Program.cs:173", "after migrate ok", new { ok = true });
        // #endregion
        startupDiagnostics.RecordCheckpoint("ef-migrations", "ok");

        startupDiagnostics.RecordCheckpoint("schema-repair", "running");
        await EnsurePortalDonorLinkedEmailSchemaAsync(db);
        await EnsureMlResidentReintegrationScoreSchemaAsync(db);
        await EnsurePublicImpactSchemaAsync(db);
        await EnsureAnalyticalMetricsSchemaAsync(db);
        startupDiagnostics.RecordCheckpoint("schema-repair", "ok");

        startupDiagnostics.RecordCheckpoint("portal-seed", "running");
        var portalStore = scope.ServiceProvider.GetRequiredService<CanonicalAdminPortalStore>();
        await portalStore.SeedAsync();
        // #region agent log
        await WriteDebugLogAsync(builder.Environment, "post-fix", "H1", "Program.cs:186", "portal seed completed (backfill path ran)", new { ok = true });
        // #endregion
        startupDiagnostics.RecordCheckpoint("portal-seed", "ok");

        startupDiagnostics.RecordCheckpoint("ml-seed", "running");
        var mlPredictionSeeder = scope.ServiceProvider.GetRequiredService<MlPredictionSeeder>();
        await mlPredictionSeeder.SeedResidentReintegrationScoresAsync();
        startupDiagnostics.RecordCheckpoint("ml-seed", "ok");

        startupDiagnostics.RecordCheckpoint("admin-seed", "running");
        var adminSeeder = scope.ServiceProvider.GetRequiredService<AdminSeeder>();
        await adminSeeder.EnsureAdminAsync();
        startupDiagnostics.RecordCheckpoint("admin-seed", "ok");
    }
    catch (Exception ex)
    {
        // #region agent log
        await WriteDebugLogAsync(builder.Environment, "pre", "H3", "Program.cs:199", "startup bootstrap exception", new
        {
            exceptionType = ex.GetType().FullName,
            message = ex.Message,
            innerMessage = ex.InnerException?.Message
        });
        // #endregion
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
else
{
    app.UseHsts();
}

app.UseCors("Frontend");
app.Use(async (context, next) =>
{
    context.Response.Headers["Content-Security-Policy"] = contentSecurityPolicy;
    await next();
});
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// #region agent log
static Task WriteDebugLogAsync(IHostEnvironment env, string runId, string hypothesisId, string location, string message, object data)
{
    var logPath = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "debug-3a6e33.log"));
    var payload = JsonSerializer.Serialize(new
    {
        sessionId = "3a6e33",
        runId,
        hypothesisId,
        location,
        message,
        data,
        timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
    });

    return File.AppendAllTextAsync(logPath, payload + Environment.NewLine);
}
// #endregion

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

static async Task EnsureMlResidentReintegrationScoreSchemaAsync(AppDbContext db)
{
    const string createTableSql = """
        IF OBJECT_ID('ml_resident_reintegration_scores', 'U') IS NULL
        BEGIN
            CREATE TABLE ml_resident_reintegration_scores
            (
                id int IDENTITY(1,1) PRIMARY KEY,
                resident_id int NOT NULL,
                snapshot_date date NULL,
                case_status nvarchar(40) NOT NULL,
                age_years decimal(9,4) NULL,
                latest_progress_percent decimal(9,4) NULL,
                latest_general_health_score decimal(9,4) NULL,
                reintegration_readiness_probability decimal(18,10) NOT NULL,
                predicted_ready_within_180d bit NOT NULL,
                prediction_timestamp datetime2 NULL,
                model_name nvarchar(120) NULL
            );
        END
        """;

    const string createIndexSql = """
        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'IX_ml_resident_reintegration_scores_resident_probability'
              AND object_id = OBJECT_ID('ml_resident_reintegration_scores')
        )
        BEGIN
            CREATE INDEX IX_ml_resident_reintegration_scores_resident_probability
            ON ml_resident_reintegration_scores(resident_id, reintegration_readiness_probability DESC);
        END
        """;

    await db.Database.ExecuteSqlRawAsync(createTableSql);
    await db.Database.ExecuteSqlRawAsync(createIndexSql);
}

static async Task EnsurePublicImpactSchemaAsync(AppDbContext db)
{
    const string sql = """
        IF OBJECT_ID('public_impact_snapshots', 'U') IS NULL
        BEGIN
            CREATE TABLE public_impact_snapshots
            (
                snapshot_id int IDENTITY(1,1) PRIMARY KEY,
                snapshot_date date NOT NULL,
                headline nvarchar(120) NOT NULL,
                summary_text nvarchar(MAX) NOT NULL,
                is_published bit NOT NULL DEFAULT 0,
                published_at datetime2 NULL
            );
        END
        ELSE
        BEGIN
            IF COL_LENGTH('public_impact_snapshots', 'id') IS NOT NULL 
               AND COL_LENGTH('public_impact_snapshots', 'snapshot_id') IS NULL
            BEGIN
                EXEC sp_rename 'public_impact_snapshots.id', 'snapshot_id', 'COLUMN';
            END
        END
        """;
    await db.Database.ExecuteSqlRawAsync(sql);
}

static async Task EnsureAnalyticalMetricsSchemaAsync(AppDbContext db)
{
    const string sql = """
        IF OBJECT_ID('safehouse_monthly_metrics', 'U') IS NULL
        BEGIN
            CREATE TABLE safehouse_monthly_metrics
            (
                metric_id int IDENTITY(1,1) PRIMARY KEY,
                safehouse_id int NOT NULL,
                month_start date NOT NULL,
                active_residents int NOT NULL DEFAULT 0,
                avg_education_progress decimal(18,4) NOT NULL DEFAULT 0,
                avg_health_score decimal(18,4) NOT NULL DEFAULT 0
            );
        END
        ELSE
        BEGIN
            IF COL_LENGTH('safehouse_monthly_metrics', 'id') IS NOT NULL 
               AND COL_LENGTH('safehouse_monthly_metrics', 'metric_id') IS NULL
            BEGIN
                EXEC sp_rename 'safehouse_monthly_metrics.id', 'metric_id', 'COLUMN';
            END
        END
        """;
    await db.Database.ExecuteSqlRawAsync(sql);
}

static SameSiteMode? TryParseSameSiteMode(string? rawValue)
{
    if (string.IsNullOrWhiteSpace(rawValue))
    {
        return null;
    }

    return rawValue.Trim().ToLowerInvariant() switch
    {
        "none" => SameSiteMode.None,
        "lax" => SameSiteMode.Lax,
        "strict" => SameSiteMode.Strict,
        "unspecified" => SameSiteMode.Unspecified,
        _ => null,
    };
}
