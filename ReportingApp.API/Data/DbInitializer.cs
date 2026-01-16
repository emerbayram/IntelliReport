using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Models;

namespace ReportingApp.API.Data;

public static class DbInitializer
{
    public static async Task Initialize(ReportDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        context.Database.EnsureCreated();

        // Seed Roles
        string[] roleNames = { "Admin", "User" };
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Seed Admin User
        var adminUser = await userManager.FindByNameAsync("admin");
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@intellireport.com",
                FullName = "System Administrator",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(adminUser, "Admin123!");
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }

        // Seed Sample Report if none exists
        if (!context.ReportDefinitions.Any())
        {
            var reports = new ReportDefinition[]
            {
                new ReportDefinition
                {
                    Name = "Monthly Sales Analysis",
                    ViewName = "V_MonthlyReport",
                    Description = "Analysis of monthly sales data by product and category."
                }
            };

            foreach (var r in reports)
            {
                context.ReportDefinitions.Add(r);
            }
            await context.SaveChangesAsync();
        }
    }
}
