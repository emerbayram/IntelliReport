using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Models;

namespace ReportingApp.API.Data;

public class ReportDbContext : IdentityDbContext<ApplicationUser>
{
    public ReportDbContext(DbContextOptions<ReportDbContext> options) : base(options) { }

    public DbSet<ReportDefinition> ReportDefinitions { get; set; }
    public DbSet<DataSource> DataSources { get; set; }
    public DbSet<ReportCategory> ReportCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ReportDefinition>()
            .HasOne(r => r.Category)
            .WithMany(c => c.Reports)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
