using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReportingApp.API.Data;
using ReportingApp.API.Models;

namespace ReportingApp.API.Services
{
    public interface ICategoryAuthorizationService
    {
        Task<List<int>> GetAccessibleCategoryIdsForUserAsync(string userId);
        Task<bool> UserHasAccessToCategoryAsync(string userId, int categoryId);
    }

    public class CategoryAuthorizationService : ICategoryAuthorizationService
    {
        private readonly ReportDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CategoryAuthorizationService(ReportDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<int>> GetAccessibleCategoryIdsForUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<int>();
            }

            // Admin users have access to all categories
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (isAdmin)
            {
                return await _context.ReportCategories.Select(c => c.Id).ToListAsync();
            }

            // Get user's roles
            var userRoles = await _userManager.GetRolesAsync(user);
            
            // Get RoleIds for the user's role names
            // Note: We use Set<IdentityRole> because Roles might not be exposed directly depending on context definition
            var roleIds = await _context.Set<IdentityRole>()
                .Where(r => userRoles.Contains(r.Name))
                .Select(r => r.Id)
                .ToListAsync();

            // 1. Direct user permissions
            var directPermissions = await _context.UserCategoryPermissions
                .Where(up => up.UserId == userId)
                .Select(up => up.CategoryId)
                .ToListAsync();

            // 2. Role based permissions
            var rolePermissions = await _context.RoleCategoryPermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Select(rp => rp.CategoryId)
                .ToListAsync();

            // Combine and return unique category IDs
            return directPermissions.Union(rolePermissions).Distinct().ToList();
        }

        public async Task<bool> UserHasAccessToCategoryAsync(string userId, int categoryId)
        {
            var accessibleCategories = await GetAccessibleCategoryIdsForUserAsync(userId);
            return accessibleCategories.Contains(categoryId);
        }
    }
}
