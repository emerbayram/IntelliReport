using Microsoft.EntityFrameworkCore;

namespace ReportingApp.API.Data;

public static class DbInitializer
{
    public static void Initialize(ReportDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.ReportDefinitions.Any())
        {
            return;   // DB has been seeded
        }

        var reports = new Models.ReportDefinition[]
        {
            new Models.ReportDefinition
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
        context.SaveChanges();
    }
}
