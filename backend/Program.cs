using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<CsvDatabaseSeeder>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Read allowed origins from config (set in appsettings.json per environment)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

if (args.Length >= 2 && args[0].Equals("--seed-csv", StringComparison.OrdinalIgnoreCase))
{
    using var seedApp = builder.Build();
    using var scope = seedApp.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<CsvDatabaseSeeder>();
    await seeder.SeedAsync(args[1]);
    return;
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
