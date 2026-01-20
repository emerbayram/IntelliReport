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
    public DbSet<UserCategoryPermission> UserCategoryPermissions { get; set; }
    public DbSet<RoleCategoryPermission> RoleCategoryPermissions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ReportDefinition>()
            .HasOne(r => r.Category)
            .WithMany(c => c.Reports)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure UserCategoryPermission composite key and relationships
        builder.Entity<UserCategoryPermission>()
            .HasKey(up => new { up.UserId, up.CategoryId });

        builder.Entity<UserCategoryPermission>()
            .HasOne(up => up.User)
            .WithMany(u => u.CategoryPermissions)
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserCategoryPermission>()
            .HasOne(up => up.Category)
            .WithMany(c => c.UserPermissions)
            .HasForeignKey(up => up.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure RoleCategoryPermission composite key and relationships
        builder.Entity<RoleCategoryPermission>()
            .HasKey(rp => new { rp.RoleId, rp.CategoryId });

        builder.Entity<RoleCategoryPermission>()
            .HasOne(rp => rp.Role)
            .WithMany()
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<RoleCategoryPermission>()
            .HasOne(rp => rp.Category)
            .WithMany(c => c.RolePermissions)
            .HasForeignKey(rp => rp.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
