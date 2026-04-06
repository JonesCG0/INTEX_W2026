using backend.Data;
using backend.Models.Auth;
using backend.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddScoped<CsvDatabaseSeeder>();
builder.Services.AddScoped<AppUserSchemaInitializer>();
builder.Services.AddScoped<AdminSeeder>();
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection("AdminSeed"));

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
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
    });
builder.Services.AddAuthorization();

// Read allowed origins from config (set in appsettings.json per environment)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

if (args.Length >= 2 && args[0].Equals("--seed-csv", StringComparison.OrdinalIgnoreCase))
{
    using var seedApp = builder.Build();
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Cannot seed CSV data because ConnectionStrings:DefaultConnection is not configured.");
    }

    using var scope = seedApp.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<CsvDatabaseSeeder>();
    await seeder.SeedAsync(args[1]);
    return;
}

var app = builder.Build();

if (!string.IsNullOrWhiteSpace(connectionString))
{
    using var scope = app.Services.CreateScope();
    var schemaInitializer = scope.ServiceProvider.GetRequiredService<AppUserSchemaInitializer>();
    await schemaInitializer.EnsureAsync();

    var adminSeeder = scope.ServiceProvider.GetRequiredService<AdminSeeder>();
    await adminSeeder.EnsureAdminAsync();
}
else
{
    app.Logger.LogWarning("DefaultConnection is not configured. Skipping database bootstrap and admin seeding.");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
