using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Models;

namespace ReportingApp.API.Data;

public class ReportDbContext : IdentityDbContext<ApplicationUser>
{
    public ReportDbContext(DbContextOptions<ReportDbContext> options) : base(options) { }

    public DbSet<ReportDefinition> ReportDefinitions { get; set; }
    public DbSet<DataSource> DataSources { get; set; }
}
