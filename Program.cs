using Debugging_Doctors.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Debugging_Doctors
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Configure JSON serialization if needed
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.WriteIndented = true; // Optional: Pretty-print JSON
                }); // Content negotiation (JSON/XML)

            // Database context
            builder.Services.AddDbContext<DebuggingDoctorsContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("mycon")));

            // Identity setup with custom User model
            builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<DebuggingDoctorsContext>()
            .AddDefaultTokenProviders();

            // Configure cookie authentication
            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/api/users/login";
                options.AccessDeniedPath = "/api/users/unauthorized";
                options.ExpireTimeSpan = TimeSpan.FromHours(2);
                options.Cookie.HttpOnly = true; // Prevent XSS
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
            });

            // Authorization
            builder.Services.AddAuthorization();

            // Password hasher
            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

            // API versioning
            //builder.Services.AddApiVersioning(options =>
            //{
            //    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
            //    options.AssumeDefaultVersionWhenUnspecified = true;
            //    options.ReportApiVersions = true;
            //})
            //.AddApiExplorer(options =>
            //{
            //    options.GroupNameFormat = "'v'VVV";
            //    options.SubstituteApiVersionInUrl = true;
            //});

            // Swagger for Open API
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Hospital API",
                    Version = "v1"
                });
            });

            // CORS for CSRF prevention
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                    builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection(); // Enforce HTTPS
            app.UseCors(); // Enable CORS

            // Custom middleware for request logging
            app.Use(async (context, next) =>
            {
                Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
                await next(context);
            });

            // CSP header for XSS prevention
            app.Use(async (context, next) =>
            {
                context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'");
                await next(context);
            });

            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Seed roles
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
                var roles = new[] { "Admin", "Doctor", "Patient" };
                foreach (var role in roles)
                {
                    if (!roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
                    {
                        roleManager.CreateAsync(new IdentityRole<int> { Name = role }).GetAwaiter().GetResult();
                    }
                }
            }

            app.Run();
        }
    }
}